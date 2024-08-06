
"use strict"

require("dotenv").config();
const { Pool } = require("pg");
const fs = require("fs");

class DataBase {

   constructor() {

      this.conn = new Pool({
         connectionString: process.env.DB_URL,
         ssl: {
            ca: fs.readFileSync("./server/ca.crt").toString(),
         },
      });
   }

   runQuery(sql) {

      return new Promise((resolve, reject) => {
         this.conn.query(sql, (err, res) => {

            if(!err) resolve(res.rows);
            else reject(console.log(err.message));
         });
      });
   }

   initPlayers() {
      const sql = `CREATE TABLE if NOT EXISTS players (
         id INT PRIMARY KEY UNIQUE NOT NULL,
         name VARCHAR(30) UNIQUE NOT NULL,
         created_At TIMESTAMP NOT NULL,
         updated_At TIMESTAMP NOT NULL
      )`;

      this.runQuery(sql);
   }

   initNewGames() {
      const sql = `CREATE TABLE if NOT EXISTS games (
         id SERIAL PRIMARY KEY UNIQUE NOT NULL,
         name VARCHAR(30) UNIQUE NOT NULL,
         player_ID INT NOT NULL,
         status BOOLEAN DEFAULT true NOT NULL,
         connected_Players INT [],
         created_At TIMESTAMP NOT NULL,
         updated_At TIMESTAMP NOT NULL
      )`;

      this.runQuery(sql);
   }

   initDB() {

      this.conn.connect(async (err) => {
         if(err) throw err;
         else console.log("Connected to BF_Manager DataBase !");
      });

      this.initPlayers();
      this.initNewGames();
   }
}

module.exports = DataBase;