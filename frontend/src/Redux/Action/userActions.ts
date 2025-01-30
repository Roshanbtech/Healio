import axiosUrl from '../../utils/axios';

export const registerForm = (userData:{
    name: string,
    email: string,
    phone: string,
    password: string,
    confirmpassword: string,

}):any =>{
    return async  () =>{
        try{
            console.log("sjvsj",userData)
            const response = await axiosUrl.post('/signUp',userData)
            console.log(response.data)
            if(response.status){
                const token = response.data.response.token
                console.log("ccc",token)
                localStorage.setItem('userOtp',token)
                return {status:true};
            }
            return response

        }catch(error:any){
            console.log(error)
            return error.response.data;
        }
        
    }
}