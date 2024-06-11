import {createStore} from 'vuex'

export default createStore({
    state: {
        user: null,
    },
    getters: {},
    mutations: {
        //用户信息
        setUser(state, obj) {
            state.user = obj;
        },
    },
    actions: {},
    modules: {}
})
