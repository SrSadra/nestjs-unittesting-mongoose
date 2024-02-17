import mongoose, { Model } from 'mongoose';
import { BookService } from './book.service';
import { Book, Category } from './schemas/book.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe("bookService" ,() => { // DESCRIBE DOESNT NEED ANY ASYNC (RETURNING A PROMISE FROM DESCRIBE IS NOT SUPPORTED)
    let bookService : BookService;
    let model : Model<Book>
    const mockBookService = { // we put our dependecies of model here. mongoose function that used in service
        findById : jest.fn(),

    }; 


    const mockBook = {
        _id : "1398104814908d1039s12k01sjd",
        user : "1398104814908d1039s12k01sjd",
        title : "vampire",
        description : "vampire in the middle of jungle",
        author : "jeff besoz",
        price : 14000,
        category : Category.CRIME
    }
    
    beforeEach(async () => {
        const module : TestingModule = await Test.createTestingModule({ // dont forget the await!
            providers : [BookService ,
                { // we used also bookModel and its functions so we should provide it in our module
                    provide : getModelToken(Book.name),
                    useValue : mockBookService
                }
            ],
        }).compile();

        bookService = module.get<BookService>(BookService);
        model = module.get<Model<Book>>(getModelToken(Book.name));

    })
    
    
    describe("findbyId" , () => { // this is our function and has 3 cenarios
        it("should return book by id" ,async () => {
        
            jest.spyOn(model , "findById").mockResolvedValue(mockBook);// spyon spies on the function and resolve it with inputed value

            const result = await bookService.findById(mockBook._id);

            expect(model.findById).toEqual(mockBook._id); // bc we called bookservice findbyid and into that it has model.findbyid
            expect(result).toEqual(mockBook);
        
        })


    it("should return incorrect book id error" ,async () => {
        const invalidId = "hahahaha";
        const isValidId = jest.spyOn(mongoose , "isValidObjectId").mockReturnValue(false); // false bc we want to get incorrect id error

        await expect(bookService.findById(invalidId)).rejects.toThrowError(BadRequestException); // it expect with invalidid we recieve badrequestexception

        expect(isValidId).toHaveBeenCalledWith(invalidId); //is false??
        isValidId.mockRestore();// it will restore the original implementation back
    })


    it("should return book not found error" ,async () => { //third scenario

        jest.spyOn(model , "findById").mockResolvedValue(null);// there is no book with such info so func will return null

        await expect(bookService.findById(mockBook._id)).rejects.toThrowError(NotFoundException);

        expect(model.findById).toHaveBeenCalledWith(mockBook._id);
    })
    })


    describe("findAll" , () => {
        jest.spyOn(model , "find").mockResolvedValue()
    })


})


