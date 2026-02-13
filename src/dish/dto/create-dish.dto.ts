export class CreateDishDto {
    dish_name: string;
    dish_description: string;
    category_id: number;
    prices: string | { size: string, price: number }[]; // Can be JSON string from form-data or array
}
