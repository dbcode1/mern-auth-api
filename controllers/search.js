const axios = require('axios')
const { harvardFormatter, rijkArtObject, clevelandArtObject, metArtObjects, artsyArtObject } = require('../helpers/artObject')
const _ = require('lodash') 
const { reject, values, forEach } = require('lodash')
const rateLimit = require('axios-rate-limit')
const http = rateLimit(axios.create(), { maxRequests: 30, perMilliseconds: 1000, maxRPS: 60 })
http.getMaxRPS() // 2

// // Refresh XAPP token
// const artsyXapp = require('artsy-xapp');
// artsyXapp.init({
//   url: 'https://api.artsy.net', // defaults to process.env.ARTSY_URL
//   id: '31f31ffds', // defaults to process.env.ARTSY_ID
//   secret: '32rf1fds' // defaults to process.env.ARTSY_SECRET
// }, function() {
//   process.env.XAPP = artsyXapp.token
// });

//artsyXapp.on('error', process.exit);

exports.search = async (req, res) => {

  const searchTerm = req.query.q
  
  function harvard() { return axios.get(`https://api.harvardartmuseums.org/object?keyword=${searchTerm}&size=100&apikey=a27500b4-d744-4b0c-a9b5-cbf8989dc970`)}

  function urlRijk(){ return axios.get( `https://www.rijksmuseum.nl/api/en/collection?key=DwmWUAgf&q=${searchTerm}&ps=100&imgonly=True&toppieces=True` )}

  function urlCleveland(){ return axios.get(`https://openaccess-api.clevelandart.org/api/artworks/?artists=${searchTerm}&has_image&limit=50`)}

  const artsy = () => {
    return axios({
      method: 'GET',
      url: `https://api.artsy.net/api/search?q=${searchTerm}`,
      headers: {
        'X-Xapp-Token': `${process.env.XAPP}`,
        'Accept': 'application/vnd.artsy-v2+json'
      }
    })
  }

  async function wiki(){
    try {
      const response = axios.get(`https://en.wikipedia.org/w/api.php?action=query&titles=${req.query.q}&format=json&prop=images`)
      return response
    }catch(error) {
      console.log(error)
    }
  }
  
  wiki().then(async data => {

    
    const response = data.data.query
    const urls = []
    const finalUrls = []
    if(!response){ console.log(response)}
    for(item in response) {
      const titles =  response[item].images
      for(item in titles){
        const fragment = titles[item].title.replace(/ /g, "_")
        const fullUrl = `http://en.wikipedia.org/w/api.php?action=query&titles=${fragment}&prop=imageinfo&iiprop=url&format=json`
        urls.push(fullUrl)
      }
    }
    
    let wikiArtObjects = await Promise.all(
      urls.map(async (url, index) => {
        if(index < 50) {
          try {
            const fileFormat = /(?:\.([^.]+))?$/;
            const wikiArt = await axios.get(url)
            const wikiObj = wikiArt.data.query.pages
            for(item in wikiObj){
              const imageUrl = wikiObj[item].imageinfo[0]
              const ext = fileFormat.exec(imageUrl.url)[1];
              if(ext !== 'svg'){
                const artObj = {
                  title: item.title,
                  img: imageUrl.url
                }
                finalUrls.push(artObj)
              } 
            }
            
          } catch (error) {
            console.log(error.message)
          }
        }
      })
    )
 

  // // MET ART
  async function metIds(){
    try {
      const response = axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/search?${searchTerm}hasImages=true&artistOrCulture=true&q=${searchTerm}`.replace(/ /g, '+'))
      return response
    }catch(error) {
      console.log(error)
    }
  }

  metIds().then(async ids => {
    const objectIds=  ids.data.objectIDs
    const urls = []
    if(objectIds){
      objectIds.map(async (id, index) => {
        const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
        if(index < 50) {
          urls.push(url)
        }
        
      }) 
    }

    let artObjects = await Promise.all(
      urls.map(async (url, index) => {
        if(index < 50) {
          const metArt = await http.get(url)
          metArtFormatter = metArtObjects(metArt, searchTerm)
          return metArtFormatter
        }
      
      })
    )
    
      // Rijk, Harvard, Cleveland Art
    const moreArtObjects = await Promise
      .all([harvard(), urlRijk(), urlCleveland(), artsy()])
      .then(
      axios.spread((...responses) => {
        const harvardArtRes = responses[0];
        const rijkArtRes = responses[1];
        const clevelandArtRes = responses[2];
        const artsyRes = responses[3]
    
        const harvardArtFormatted = harvardFormatter(harvardArtRes, searchTerm)
        const newRijkObjects = rijkArtObject(rijkArtRes, searchTerm)
        const newClevelandObjects = clevelandArtObject(clevelandArtRes, searchTerm)
        const newArtsyObjects = artsyArtObject(artsyRes, searchTerm)

        const rijHarClev = [...harvardArtFormatted, ...newRijkObjects,  ...newClevelandObjects, ...newArtsyObjects]
        return rijHarClev
    }))
   
    console.log(moreArtObjects)
    artObjects = artObjects.concat(moreArtObjects, finalUrls)
    if(!artObjects || artObjects === 'undefined' || artObjects === null){
      res.status(400).json({message: "Sorry, no results"})
    }

    res.status(200).send(artObjects)
  }).catch(error => {
    console.log(error)
  })
})
}





