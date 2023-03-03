
export let API_URL = ""

if(import.meta.env.DEV){
	API_URL = "http://localhost:1337"
}