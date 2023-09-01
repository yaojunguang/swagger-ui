import axios from "axios";
import {getCookie} from "@/components/common";

axios.defaults.baseURL = "";
//设置超时
axios.defaults.timeout = 15000;
axios.defaults.crossDomain = true;
axios.defaults.withCredentials = true;

axios.interceptors.request.use(
    config => {
        config.withCredentials = true;
        config.headers["AccessToken"] = getCookie("Access_Token");
        //本地环境，写死header
        if (import.meta.env.DEV) {
            config.headers["X-GATEWAY-XMS-USERID"] = "3151";
        }
        if (config.method.toUpperCase() === 'POST' || config.method.toUpperCase() === 'PATCH' || config.method.toUpperCase() === 'PUT') {
            //POST请求，参数转化
            if (config.params && config.data === undefined) {
                const formData = new FormData();
                for (let mapKey in config.params) {
                    if (config.params.hasOwnProperty(mapKey)) {
                        formData.append(mapKey, config.params[mapKey]);
                    }
                }
                config.data = formData;
                config.params = undefined;
            }
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default axios;