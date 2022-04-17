
"use strict"

require("dotenv").config();
const { Client } = require("pg");

class DataBase {

   constructor() {
      this.conn = new Client({
         host: process.env.DB_HOST,
         user: process.env.DB_USER,
         port: process.env.DB_PORT,
         password: process.env.DB_PASSWORD,
         database: process.env.DB_NAME,
      });
   }

   runQuery(sql, socket, queryObj) {
      
      this.conn.query(sql, (err, res) => {
         if(err) {
            console.log(err.message);
            if(socket) socket.emit(queryObj.errorChannel, (queryObj.errorMessage));
         }
         else if(socket) socket.emit(queryObj.successChannel);
      });
   }

   initPlayers() {
      const sql = `CREATE TABLE if NOT EXISTS players (
         id SERIAL PRIMARY KEY UNIQUE NOT NULL,
         name VARCHAR(30) UNIQUE NOT NULL,
         created_At DATE NOT NULL,
         updated_At DATE NOT NULL
      )`;

      this.runQuery(sql);
   }

   initNewGames() {
      const sql = `CREATE TABLE if NOT EXISTS games (
         id SERIAL PRIMARY KEY UNIQUE NOT NULL,
         name VARCHAR(30) UNIQUE NOT NULL,
         player_ID INT NOT NULL,
         status BOOLEAN DEFAULT true NOT NULL,
         connected_Players TEXT [],
         created_At DATE NOT NULL,
         updated_At DATE NOT NULL
      )`;

      this.runQuery(sql);
   }

   initDB() {

      this.conn.connect((err) => {
         if(err) throw err;
         else console.log("Connected to BF_Manager DataBase !");
      });

      this.initPlayers();
      this.initNewGames();
   }
}

module.exports = DataBase;