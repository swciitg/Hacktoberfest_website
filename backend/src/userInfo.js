
import axios from 'axios';
function getUserInfo(access_token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios.get('https://api.github.com/user', {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            });
            if (response.status === 200) {
                const userData = response.data;
                return userData;
            }
            else {
                console.error(`Failed to fetch GitHub profile data. Status code: ${response.status}`);
            }
        }
        catch (error) {
            console.error('An error occurred:', error);
        }
    });
}
export default getUserInfo;
