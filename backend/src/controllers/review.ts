import { ReviewRequest, ReviewResponse, ErrorResponse } from '../types/review';
import { Request, Response} from 'express';
import { PrismaClient } from '@prisma/client';
import { queue } from '../queues/reviewQueue';

const prisma = new PrismaClient();


export const handlerReview = async function (req: Request<{},{},ReviewRequest>,res: Response<ReviewResponse | ErrorResponse>) {
	if(typeof req.body.code !== 'string')  return res.status(400).json({error: 'Code must be a string'});       
	if(!req.body.code) return res.status(400).json({error: 'No code provided'});
	
	try{
		const review = await prisma.review.create({
			data: {
				code: req.body.code,
				userId: (req as any).userId
			}
		});
		
		await queue.add('analyze',{ reviewId: review.id, code: review.code});

		return res.json(review);
	} catch(error) {
		console.log(error);
		return res.status(500).json({error: 'Database error'});
	}
}

export const getAllReviews = async function(req: Request,res: Response) {
	try{
		const all = await prisma.review.findMany();
		return res.json(all);
	} catch(error) {
		return res.status(500).json({error: 'Database error'});
	}
}

export const getReviewById = async function(req: Request,res: Response<ErrorResponse | ReviewResponse>) {
	const id = req.params.id;
	if(isNaN(Number(id))) return res.status(400).json({error: 'Invalid ID'});
	
	try {	
		const user = await prisma.review.findUnique({where: { id: Number(id)}});
		if(!user) return res.status(404).json({error: 'not found'});
		return res.json(user);
	} catch(error) {
		return res.status(500).json({error: 'Database error'});
	}
}

export const updateReview = async function(req: Request<{id: string},{},{result: string}>,res: Response<ErrorResponse | ReviewResponse>) {
	const id = req.params.id;
	if(isNaN(Number(id))) return res.status(400).json({error: 'Invalid ID'});
	
	try{
		const user = await prisma.review.findUnique({where: {id: Number(id)}});
		if(!user) return res.status(404).json({error: 'not found'});
		
		const updated = await prisma.review.update({
			where: { id: Number(id)},
			data: { result: req.body.result}
		});
		return res.json(updated);
	} catch(error) {
		return res.status(500).json({error: 'Database error'});
	}
}

export const deleteReview = async function(req: Request,res: Response<ErrorResponse | ReviewResponse>){
	const id = req.params.id;
	if(isNaN(Number(id))) return res.status(400).json({error: 'Invalid ID'});
	
	try{
		const user = await prisma.review.findUnique({where: {id: Number(id)}});
		if(!user) return res.status(404).json({error: 'not found'});
		
		const deletedUser = await prisma.review.delete({
			where: {
				id: Number(id)
			}
		});
		return res.json(deletedUser);
	} catch(error) {
		return res.status(500).json({error: 'Database error'});
	}
}
