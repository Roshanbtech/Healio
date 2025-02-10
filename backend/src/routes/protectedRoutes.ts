import {Router} from 'express';
import refresh from '../helper/refreshToken';



const route = Router();




route.post('/refresh',refresh );

export default route;
