import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'


export default async function getDb(){
	const db = await open({
      filename: './db/main.db',
      driver: sqlite3.Database,
    })
	await db.exec("PRAGMA foreign_keys = ON;")
	await db.exec("PRAGMA journal_mode = WAL;")
	await db.exec("PRAGMA temp_store = memory;")
	await db.exec("PRAGMA mmap_size = 30000000000;")
	await db.exec("PRAGMA synchronous = normal;")
	await db.exec("PRAGMA vacuum;")
	await db.exec("PRAGMA optimize;")
	
	return db 
} 

