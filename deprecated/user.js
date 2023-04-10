
const db = require('../utils/database')

module.exports = class User {
    constructor(id, password, nickname) {
      this.id = id;
      this.password = password
      this.nickname = nickname;
    }
    async save(){
      console.log(this.password)
      await db.query("INSERT INTO users (password, nickname) VALUES (crypt($1, gen_salt('bf')), $2);", [this.password, this.nickname]).catch(err => console.log(err))
    }

    static async fetchAll(){
      const {rows} = await db.query('SELECT * FROM users').then()
      return rows
    }

    static findById(){
      
    }

  };