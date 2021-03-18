const axios = require('axios')

exports.getImages = (searchTerm) => { axios.get('http://en.wikipedia.org/w/api.php?action=query&titles=File:Albert_Einstein_(Nobel).png&prop=imageinfo&iiprop=url&format=json').then(res => {
    return res.data
})
}
