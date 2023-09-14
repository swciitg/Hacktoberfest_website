var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from 'axios';
function getUserInfo(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("ACCESS TOKEN ", accessToken);
        try {
            const response = yield axios.get('https://api.github.com/user', {
                headers: {
                    Authorization: `token ${accessToken}`,
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
