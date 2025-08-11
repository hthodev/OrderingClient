import { Food } from "./food";
import { apiRequest } from "./request";

type RangeType = "week" | "month" | "year";

export interface ChartItem {
  label: string;
  total: number;
}

interface OrdersByTimeRange {
  range: RangeType;
  chartData: ChartItem[];
}

export interface TopFoodChartItem {
  name: string;
  quantity: number;
}

export interface TopBeerChartItem {
  name: string;
  quantity: number;
}

export interface TopFood {
  range: RangeType;
  topFoods: TopFoodChartItem[];
  topBeers: TopBeerChartItem[];
}

export interface InvoiceList {
  _id: string;
  orderer: {
    _id: string;
    username: string;
    fullName: string;
  };
  cashier?: {
    _id: string;
    username: string;
    fullName: string;
  };
  table: {
    _id: string;
    name: string;
  };
  isPayment: boolean;
  createdAt: string;
  updatedAt: string;
  paymentTime: string;
  total: number;
}

export interface Users {
  _id: string;
  username: string;
  fullName: string;
  gender: "MALE" | "FEMALE";
  phone: string;
  image: string;
  position: string;
  isActive: true;
  createdAt: string;
  updatedAt: string;
  itsMe?: boolean;
}

export default class ManagerService {
  static async OrdersByTimeRange(
    date: string,
    type: string
  ): Promise<OrdersByTimeRange> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.get(
          `/manager/orders/ordersByTimeRange?type=${type}&date=${date}`
        );
        if (result?.statusCode === 200) {
          return resolve(result);
        } else {
          return reject(result);
        }
      } catch (error: any) {
        return reject(error);
      }
    });
  }

  static async TopFoods(date: string, type: string): Promise<TopFood> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.get(
          `/manager/foods/topFoods?type=${type}&date=${date}`
        );
        if (result?.statusCode === 200) {
          return resolve(result);
        } else {
          return reject(result);
        }
      } catch (error: any) {
        return reject(error);
      }
    });
  }

  static async NewFood(form: Food): Promise<{ success: boolean }> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.post(`/food/create`, form);
        if (result?.statusCode === 201) {
          return resolve(result);
        } else {
          return reject(result);
        }
      } catch (error: any) {
        return reject(error);
      }
    });
  }

  static async UpdateFood(
    _id: string,
    form: Food
  ): Promise<{ success: boolean }> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.put(`/food/updateFood/${_id}`, form);
        if (result?.statusCode === 200) {
          return resolve(result);
        } else {
          return reject(result);
        }
      } catch (error: any) {
        return reject(error);
      }
    });
  }

  static async DeleteFood(_id: string): Promise<{ success: boolean }> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.delete(`/food/deleteFood/${_id}`);
        if (result?.statusCode === 200) {
          return resolve(result);
        } else {
          return reject(result);
        }
      } catch (error: any) {
        return reject(error);
      }
    });
  }

  static async InvoicesByDate(date: string | Date): Promise<InvoiceList[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.get(
          `/manager/orders/invoicesByDate?date=${date}`
        );
        if (result?.statusCode === 200) {
          return resolve(result);
        } else {
          return reject(result);
        }
      } catch (error: any) {
        return reject(error);
      }
    });
  }

  static async Accounts(position: string, search:string): Promise<Users[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await apiRequest.get(`/manager/users/accounts?position=${position}&search=${search}`);
        if (result?.statusCode === 200) {
          return resolve(result);
        } else {
          return reject(result);
        }
      } catch (error: any) {
        return reject(error);
      }
    });
  }
}
