import { JwtService } from '@nestjs/jwt';
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Model } from "mongoose";
import { AuthService } from "./auth.service"
import { User } from "./schemas/user.schema";
import * as bcrypt from 'bcryptjs';
import { ConflictException } from '@nestjs/common';



describe("authService" , () =>{

  const authService : AuthService;
  const model : Model<User>;
  const jwtService: JwtService; // we want to use jwt functions so like authService we add it here

  const mockUserService = { // functions we used from model
    create : jest.fn()
  }

  const mockUser = {
    name : "mamad",
    email : "mamad@gmail.com",
    password : "unhashed"
  }

  let hashedMockUser = {
    ...mockUser
  }


  beforeAll(async () => {
    const module : TestingModule = await Test.createTestingModule({
      providers : [AuthService , 
        JwtService // bc we have jwt in our service depedencies so we should add it here
        ,{
        provide : getModelToken(User.name),
        useValue : mockUserService
      }]
    })

    authService = module.get<AuthService>(AuthService);
    model = module.get<Model<User>>(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);

  })

  it("authService should be defined" , () => { // this is optional
    expect(authService).toBeDefined();
  })


  describe("signUp" , () => {
    it("create user and return its token" ,async () => {

      const hashed = "hashed passwordoo";
      const token = "some token!";

      jest.spyOn(bcrypt , "hash").mockImplementation(() => Promise.resolve(hashed)); // returning hashed string , trying to use mockresolev gives error

      // jest.spyOn(model , "create").mockResolvedValue({ // it doesnt work!
      //   ...mockUser ,
      //   password : hashed
      // })

      jest.spyOn(model , "create").mockImplementation(() => Promise.resolve({
        ...mockUser,
        password : hashed
      }))

      jest.spyOn(jwtService , "sign").mockReturnValue(token); // bc we dont return a promise so we use mockReturnValue

      const result = await authService.signUp(mockUser);


      expect(bcrypt.hash).toHaveBeenCalled(); 
      expect(result).toEqual({token});

      hashedMockUser = {
        ...mockUser,
        password : hashed
      }
    })


    it("it should return error for duplicated email",async () => {

      jest.spyOn(model , "create").mockImplementation(() => Promise.reject({code : 11000})); //note we used reject for promise!

      await expect(authService.signUp(mockUser)).rejects.toThrow(ConflictException);
    })
  })

  describe("login" , () => {
    it("should login user and return its token" ,async () => {
      const token = "some token2";

      jest.spyOn(model , "findOne").mockResolvedValue(hashedMockUser);

      jest.spyOn(bcrypt , "compare").mockImplementation(() => true);

      jest.spyOn(jwtService , "sign").mockReturnValue(token);

      const result = await authService.login({
        email: mockUser.email,
        password : mockUser.password
      })

      expect(result).toEqual({token});
    })
  })
})