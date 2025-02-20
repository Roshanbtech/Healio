import { Model } from 'mongoose';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  speciality?: string;
  populate?: any;
}

/**
 * Reusable pagination function.
 * @param model - The Mongoose model to query.
 * @param options - Pagination options including page, limit, search, speciality, and populate.
 * @param additionalQuery - Any additional query criteria (optional).
 * @returns An object containing paginated data and pagination metadata.
 */
export const paginate = async <T>(
  model: Model<T>,
  options: PaginationOptions,
  additionalQuery: Record<string, any> = {}
): Promise<{
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 10;
  const skip = (page - 1) * limit;

  const query: Record<string, any> = { ...additionalQuery };

  if (options.search) {
    query.$or = [
      { name: { $regex: options.search, $options: 'i' } },
      { email: { $regex: options.search, $options: 'i' } },
    ];
  }

  if (options.speciality) {
    // Ensure the field name matches your schema exactly
    query.speciality = options.speciality;
  }

  // Build the query and apply population if provided.
  let queryBuilder = model.find(query).skip(skip).limit(limit);
  if (options.populate) {
    queryBuilder = queryBuilder.populate(options.populate);
  }

  const dataPromise = queryBuilder;
  const countPromise = model.countDocuments(query);

  const [data, total] = await Promise.all([dataPromise, countPromise]);
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};
