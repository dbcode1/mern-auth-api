const express = require('express')
const router = express.Router()

const {requireSignin} = require('../controllers/auth')


const { 
  collectionSave, 
  collectionDelete,
  cardSave,
  getCollections, 
  getCards,
  getCollectionTitles }
    = require('../controllers/collections')

router.post('/collections', requireSignin, collectionSave)
router.delete('/collections/delete', collectionDelete)
router.post('/cards', cardSave)
router.get('/cards', getCards)
router.get('/collections', getCollections)
router.get('/collections/titles', getCollectionTitles)

module.exports = router