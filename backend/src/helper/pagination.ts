import { Model } from "mongoose";

export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  speciality?: string;
  status?: string;
  searchFields?: string[]; 
  populate?: any;
  select?: string;
}

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

  if (options.search && options.searchFields && options.searchFields.length > 0) {
    query.$or = options.searchFields.map((field) => ({
      [field]: { $regex: options.search, $options: "i" }
    }));
  } else if (options.search) {
    // Fallback to search by 'name' if no searchFields provided.
    query.$or = [{ name: { $regex: options.search, $options: "i" } }];
  }

  if (options.speciality) {
    query.speciality = options.speciality;
  }

  if (options.status) {
    query.docStatus = options.status;
  }

  let queryBuilder = model.find(query).skip(skip).limit(limit);
  if (options.select) {
    queryBuilder = queryBuilder.select(options.select);
  }
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
