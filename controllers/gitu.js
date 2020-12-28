export const getUserSuccess = (username) => async dispatch => {
  
  ////    IGNORE THIS FILE
  
  // const REQUEST = `https://api.github.com/users/${username}`
  // const REQUEST = `https://api.github.com/search/repositories?q=language:${username}&order=desc`
 const REQUEST = `https://api.github.com/repos/${username}/CS-Notes/languages`
  const client_id = 'e711e8d32ba8aea7c60f'
  const client_secret = 'b52543a7c2090f6a10725ac75f2dec03fbe4e2c9';
  const token = '8243baf7118540774a9a7553fa2374ddc19bfa3b';
 var config = { 
      headers: {
          'Authorization': 'token 8243baf7118540774a9a7553fa2374ddc19bfa3b'
       }
      }
      const response = await axios.get(REQUEST,config);
      console.log("response",response)
      dispatch({
        type:GET_USER_SUCCESS,
        payload:response.data
      });
}


  ////    IGNORE THIS FILE