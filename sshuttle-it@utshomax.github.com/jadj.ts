let axios = require('axios');
export async function likeTheTweet(tweetId: string, access_token: string, user_id?: string) {
    try {
        let token = await tokenDecode(access_token);
        console.log("token==>", token);
        const tweetLikingsResponse = await axios.post(
            `https://api.twitter.com/2/users/${user_id}/likes`,
            {
                headers: {
                    'Authorization': `Bearer MF9yZUxXZHdjODdJelIwdkZVNm02dldlQmZ0X0tzVTFtNzR0Wl9aWnBsMnpZOjE2ODMxNzY2MTcyNDI6MToxOmF0OjE`,
                },
                body: JSON.stringify({
                    "tweet_id": "1652954255605776384"
                })

            },

        );
        console.log(`getTweetLikingUsers got response`);
        return tweetLikingsResponse.data as TweetLikings;
    } catch (error) {
        console.log(`getTweetLikingUsers got error resonse`, { err: error?.response?.data, err2: error });
        return null
    }
}