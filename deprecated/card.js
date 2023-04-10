const db = require('../utils/database')
const axios = require('axios');

module.exports = class Card {
    constructor(id, cardUrl) {
      this.id = id;
      this.cardUrl = cardUrl
    }
    static async fetchAll(){
      let queryString = {
        key:process.env.TRELLOAPIKEY,
        token:process.env.TRELLOAPITOKEN,
      }
      let cards = await axios.get('https://api.trello.com/1/boards/Nfw1292a/cards', {
          params: queryString
      })
      return cards
    }

    static async findByUrl(cardUrl){
        let queryString = {
            key:process.env.TRELLOAPIKEY,
            token:process.env.TRELLOAPITOKEN,
    
        }
        let card = await axios.get('https://api.trello.com/1/cards/'+cardUrl, {
            params: queryString
        })
        let attachments = await axios.get('https://api.trello.com/1/cards/'+cardUrl+'/attachments', {
            params: queryString
        })
        return {
            card_data:card.data,
            attachment_data:attachments.data
        }
    }

  };