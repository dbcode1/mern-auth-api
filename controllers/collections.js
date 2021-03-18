const { inRange, _ } = require('lodash');
const User = require('../models/user');
const Card = require('../models/card')
const Collection = require('../models/collection')
const getUser = require('../helpers/getUser')
 
exports.collectionSave = async (req, res) => {
  let title = req.query.q
  const user = User.findOne({_id: req.user._id}, (err, user) => {
    if( err || !user){
      return res.status(400).json({
        error: 'User not found'
      })
    } else {
      const exists = user.collections.some(obj => obj.title === title)
      if(exists){
        return res.status(400).json({ "message": "Collection Exists"})
      }
      const newCollection = user.collections.push({ title: title})
      user.save((err) => {
        if (err) {
            console.log('Collection Add Error', err);
            return res.status(400).json({
                error: 'Collection Added Failure'
            });
        }
        res.json(user.collections)
      });
    }
  })
}

exports.getCollectionTitles = async (req, res) => {
  console.log(req.query)
  const user = User.findOne({_id: req.query.id}, (err, user) => {
    if( err || !user){
      return res.status(400).json({
        error: 'User not found'
      })
    } 
    const titles = user.collections.map(item => {
      return item.title
    })
    res.send(titles)
  })
}

exports.getCollections = async (req, res) => {
  const user = User.findOne({_id: req.query.id}, (err, user) => {
    if( err || !user){
      return res.status(400).json({
        error: 'User not found'
      })
    } 
    res.send(user.collections)
  })
}

exports.collectionDelete = async (req, res) => {
    // get title from req
    const {title, id} = req.body
    console.log('req', req.body)
    // lookup user with id
    const user = User.findById({_id: id}, (err, user) => {
      if( err || !user){
        return res.status(400).json({
          error: 'User not found'
        })
      } 
      const deleted = user.collections.filter(obj => obj.title !== title)
      user.collections = deleted;
      user.save()
      res.status(200).send(deleted)
    })
  }


exports.cardSave = async (req, res) => {
  const {title, img, name, date, containerTitle, id} = req.query
  ;
  const card = {
    title,
    img,
    name,
    date,
    containerTitle,
  }
  
  const user = User.findOne({_id: id}, (err, user) => {
    if(!user || err) {
      res.status(400).json('User not found.')
    } else {
      // look up the right collection
      user.collections.map(item => {
        if(item.title === card.containerTitle) {
          item.cards.push(card)
        }
      }) 
    }
    user.save((err) => {
      if (err) {
          console.log('CARD ADD ERROR', err);
          return res.status(400).json({
              error: 'Card Added Failure'
          });
      }
      res.json({ message: 'Card Saved'})
    });
  })
}

exports.getCards = async (req, res) => {
  const {id, title} = req.query
  const user = User.findOne({_id: id}, (err, user) => {
    
    if( err || !user){
      return res.status(400).json({
        error: 'No Art here'
      })
    } 

    const collectionCards = user.collections.map(item => {
      if(item.title === title){
        return item
      }
    })
    collectionCards.map(item => {
      if(item){
      console.log(item.cards)
      }
    })
    res.status(200).send(collectionCards)
  })
}
