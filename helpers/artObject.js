
exports.harvardFormatter = (data, searchTerm) => {
  const harvardArtObjects = []
  if(!data.data.records){ return }
    data.data.records.map( record => {
      const type = record.classification
      if(type === 'Paintings' || type ==='Drawings'){ 
        if(record.primaryimageurl) {
          const artObj = {
            name: record.people ? record.people[0].displayname: '',
            title: record.title,
            img: record.primaryimageurl,
            date: record.datebegin
          }
        
        if(artObj.name.toLowerCase().match(searchTerm.toLowerCase())){
          harvardArtObjects.push(artObj)
        }
      }
      }
    })
    return harvardArtObjects
    
}

 exports.rijkArtObject = (data, searchTerm) => {
  if(!data.data.artObjects){ return }
  const allArtObjects = []
  data.data.artObjects.map(async item => { 
    if(!item) { return }
    if(!item.principalOrFirstMaker.toLowerCase().includes(searchTerm.toLowerCase())){
      return}
    const title = item.title
      const artObj = {
        name: item.principalOrFirstMaker,
        title: title,
        img: item.webImage.url,
        caption: '',
        date: '',
        containerTitle: ''
      }
      if(artObj.img) {
        allArtObjects.push(artObj)
      }
      

  })
  return allArtObjects
}

exports.clevelandArtObject = (data, searchTerm) => {
  // create new obj with desired fields
  const allArtObjects = []
  const values = Object.values(data.data.data)
  if(!item){ return}
  values.map(item => {
    // console.log(item)
    if(!item.images) { return }
    const artObj = {
      name: item.creators[0].description.split("(")[0],
      title: item.title.split(" ").splice(0, 6).join(" "),
      img: item.images.web.url,
      date: item.creation_date,
      containerTitle: ''
    }
    allArtObjects.push(artObj)
  })
  return allArtObjects
}

exports.metArtObjects = (response, searchTerm) => {
  if(!response){return}
  const r = response.data
  if(r.artistDisplayName.toLowerCase().includes(searchTerm.toLowerCase())) {
    const obj = {
      name: r.artistDisplayName,
      title: r.title.split("(" || ";"[0]),
      img: r.primaryImageSmall,
      caption: '',
      date: r.objectDate,
      containerTitle:''
    }
    return obj
   }
}

exports.artsyArtObject = (data, searchTerm) => {
  // create new obj with desired fields
  
  const allArtObjects = []
  const values = data.data._embedded.results
 
  
  values.map(item => {
    if(item._links.thumbnail) {
      console.log(item._links)
      const img = item._links.thumbnail.href
      const artObj = {
        title: item.title.split(" ").splice(0, 6).join(" "),
        img: img,
      }
    
    allArtObjects.push(artObj)
    }
  })
  return allArtObjects
}
