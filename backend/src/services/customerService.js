// backend/src/services/customerService.js
import { v4 as uuidv4 } from 'uuid';
import Customer from '../models/Customer.js';

export const createCustomers = async (payload) => {
  if (Array.isArray(payload)) {
    // batch create: use upsert by email to avoid duplicates
    const results = [];
    for (const c of payload) {
      const data = {
        email: c.email,
        name: c.name || '',
        phone: c.phone || '',
        attributes: c.attributes || {},
        totalSpend: c.totalSpend != null ? c.totalSpend : 0,  // default to 0 if not provided
      };
      const doc = await Customer.findOneAndUpdate(
        { email: data.email },
        data,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      results.push(doc);
    }
    return results;
  } else {
    const data = {
      email: payload.email,
      name: payload.name || '',
      phone: payload.phone || '',
      attributes: payload.attributes || {},
      totalSpend: payload.totalSpend != null ? payload.totalSpend : 0, // default
    };
    const doc = await Customer.findOneAndUpdate(
      { email: data.email },
      data,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return doc;
  }
};

export const getCustomerById = async (id) => {
  return Customer.findById(id).lean();
};

export const findByFilter = async (filter = {}) => {
  return Customer.find(filter).lean();
};
