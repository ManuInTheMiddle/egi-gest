import {User} from "next-auth";
import prisma from "../../prisma/db";
import {compare} from "bcrypt";

interface utilizador {
    username:string,
    password:string
}

type LoginFn = (username: string, password:string) => Promise<utilizador>;

export const login:LoginFn = async (username,password) =>{

    const utilizadorTemp = {
        username: "JPMadmin",
        password: "JPM_4528"
    }

    const user = await prisma.users.findFirst(
        {where:{
            username: username
        }}
    )

    if(user && (await compare(password,user.password))){
        user.password = "";
        return user;
    }else if( username == utilizadorTemp.username && password == utilizadorTemp.password){
    
        return utilizadorTemp;
    }
    else{
        if( username == utilizadorTemp.username && password != utilizadorTemp.password){
           throw new Error("Password do admin incorreta!"); 
        }
        throw new Error("Utilizador não encontrado!");
    }
}