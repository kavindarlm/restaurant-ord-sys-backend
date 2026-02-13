export class CreateCartItemDto {

  quantity: number;

  dish_id: number;

  cart_id: string;

  is_deleted?: boolean;
}
