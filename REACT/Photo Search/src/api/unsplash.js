import axios from 'axios';

//creates a default copy of axios request
 export default axios.create({
	baseURL:'https://api.unsplash.com',
	headers:{
		Authorization: `Client-ID ${process.env.REACT_APP_unsplashID}` 
	}
});