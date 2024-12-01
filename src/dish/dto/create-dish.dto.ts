export class CreateDishDto {
    dish_name: string;
    dish_description: string;
    dish_image_url: string;
    category_id: number;
    prices: { size: string, price: number }[];
}
