import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosRequestConfig } from 'axios';
import { useAccountContext } from '@/context/AccountContext';
import { backendClient } from '@/utils/endpoints';
import { AccountData } from '@/models/Account';
import { Stampbook } from '@/models/Stampbook';

export const useAccount = () => {
    const { setAccountData  } = useAccountContext();
    
    const getAccountData = async () => {
        const uid = await AsyncStorage.getItem('uid');

        const config: AxiosRequestConfig = {
            method: 'get',
            url: `account/${uid}`,
        };

        try {
            const response = await backendClient(config);

            const userData: AccountData = {
                ...response.data.user_info
            };

            const books: any = response.data.user_info.books;

            if (!books) {
                setAccountData(userData);
                console.log('no books');
                return userData;
            }

            let userBooks: Stampbook[] = []

            for (const key in books) {
                userBooks.push({
                    id: key,
                    ...books[key]
                })
            }
            userData.books = userBooks;

            setAccountData(userData);
            return userData;
        } catch (error) {
            console.error('UID Search Error', error);
            return;
        }
    };

    return {
        getAccountData,
    };
};