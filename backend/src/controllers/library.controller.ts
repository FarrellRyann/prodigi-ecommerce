import type { Request, Response, NextFunction } from 'express';
import * as libraryService from '../services/library.service.ts';

type AuthRequest = Request & {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
};

export const getLibrary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const library = await libraryService.getUserLibrary(userId);
    res.json({ data: library });
  } catch (error) {
    next(error);
  }
};

export const getLibraryProductDownload = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const productId = req.params.productId as string;
    if (!productId) {
      res.status(400).json({ error: 'Product ID is required' });
      return;
    }

    const downloadInfo = await libraryService.getDownloadUrl(userId, productId);
    
    // Kita return response info berupa JSON untuk fleksibilitas FE
    res.json({ data: downloadInfo });
  } catch (error) {
    next(error);
  }
};

// Endpoint: GET /library/:productId/access (unified access)
export const getLibraryProductAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const productId = req.params.productId as string;
    if (!productId) {
      res.status(400).json({ error: 'Product ID is required' });
      return;
    }

    const accessInfo = await libraryService.getAccessUrl(userId, productId);
    res.json({ data: accessInfo });
  } catch (error) {
    next(error);
  }
};
