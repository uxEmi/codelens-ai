import 'dotenv/config';
import './workers/reviewWorker';
import express from 'express';
import reviewRouter from './routes/review';
import authRouter from './routes/auth';
import { Request, Response} from 'express';
import { limiter } from './middleware/rateLimit';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use(limiter);
app.use(reviewRouter);
app.use(authRouter);
app.use((err: Error, req: Request, res: Response, next: Function) => {
	console.error(err);
	res.status(500).json({error: 'Something went wrong'});
});

app.listen(3000,() => {
	console.log('Server started');
})
