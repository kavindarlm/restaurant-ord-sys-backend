# Role-Based Authorization Implementation Guide

## ✅ What Has Been Fixed

1. **JWT Payload Structure** - Now includes: `user_id`, `user_name`, `user_email`, `user_role`
2. **Cookie/JWT Expiration** - Both set to 24 hours
3. **JWT Secret** - Now uses environment variable `JWT_SECRET`
4. **Role Guards** - Created `RolesGuard` and `@Roles()` decorator
5. **Protected User Endpoints** - Added authorization to all user management endpoints

## 🔐 User Endpoint Protection

### Current Setup:
- `POST /user` - ✅ Public (user registration)
- `POST /user/login` - ✅ Public (login)
- `GET /user` - 🔒 **ADMIN ONLY**
- `GET /user/:id` - 🔒 **Own profile or ADMIN**
- `PATCH /user/:id` - 🔒 **Own profile or ADMIN**
- `DELETE /user/:id` - 🔒 **ADMIN ONLY**
- `POST /user/logout` - 🔒 **Authenticated users**
- `GET /auth/me` - 🔒 **Authenticated users**

## 🚀 How to Protect Other Endpoints

### Example 1: Cart Endpoints (User owns their cart)

```typescript
// cart.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwtauthGuard';
import { GetUser } from '../Auth/get-user.decorater';

@Controller('carts')
@UseGuards(JwtAuthGuard)  // Require authentication for all cart endpoints
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  findUserCart(@GetUser() user: any) {
    // Return only the current user's cart
    return this.cartService.findByUserId(user.user_id);
  }

  @Post()
  create(@Body() createCartDto: CreateCartDto, @GetUser() user: any) {
    // Create cart for the authenticated user
    return this.cartService.create(createCartDto, user.user_id);
  }
}
```

### Example 2: Order Endpoints (Users see their orders, admins see all)

```typescript
// order.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwtauthGuard';
import { RolesGuard } from '../Auth/roles.guard';
import { Roles } from '../Auth/roles.decorator';
import { GetUser } from '../Auth/get-user.decorater';
import { UserRole } from '../user/enum/user-role.enum';

@Controller('order')
@UseGuards(JwtAuthGuard)  // All endpoints require authentication
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  createOrder(@Body() createOrderDto: CreateOrderDto, @GetUser() user: any) {
    // Create order for the authenticated user
    return this.orderService.createOrder(createOrderDto, user.user_id);
  }

  @Get('my-orders')
  getMyOrders(@GetUser() user: any) {
    // Users get their own orders
    return this.orderService.findByUserId(user.user_id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getAllOrders() {
    // Only admins can see all orders
    return this.orderService.findAll();
  }
}
```

### Example 3: Dish/Menu Endpoints (Public read, admin write)

```typescript
// dish.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../Auth/jwtauthGuard';
import { RolesGuard } from '../Auth/roles.guard';
import { Roles } from '../Auth/roles.decorator';
import { UserRole } from '../user/enum/user-role.enum';

@Controller('dish')
export class DishController {
  constructor(private readonly dishService: DishService) {}

  @Get()  // Public - anyone can view menu
  findAll() {
    return this.dishService.findAll();
  }

  @Get(':id')  // Public - anyone can view dish details
  findOne(@Param('id') id: string) {
    return this.dishService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)  // Only admin can create dishes
  create(@Body() createDishDto: CreateDishDto) {
    return this.dishService.create(createDishDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)  // Only admin can update dishes
  update(@Param('id') id: string, @Body() updateDishDto: UpdateDishDto) {
    return this.dishService.update(+id, updateDishDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)  // Only admin can delete dishes
  remove(@Param('id') id: string) {
    return this.dishService.remove(+id);
  }
}
```

## 🔑 Environment Setup

### 1. Create .env file:
```bash
cp .env.example .env
```

### 2. Generate a secure JWT secret:
```bash
# On Windows (PowerShell)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# On Linux/Mac
openssl rand -hex 64
```

### 3. Update .env with the generated secret:
```env
JWT_SECRET=your_generated_secret_here
NODE_ENV=development
```

### 4. In production, set:
```env
NODE_ENV=production
```

## 📋 Guard Usage Patterns

### Pattern 1: Authentication Only
```typescript
@UseGuards(JwtAuthGuard)
```
- Requires user to be logged in
- Any authenticated user can access

### Pattern 2: Role-Based Authorization
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
```
- Requires user to be logged in
- Only users with ADMIN role can access

### Pattern 3: Multiple Roles
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.USER)
```
- Requires user to be logged in
- Users with ADMIN **or** USER role can access

### Pattern 4: Controller-Level Protection
```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  // All endpoints in this controller require ADMIN role
}
```

## 🎯 Next Steps

1. **Protect remaining endpoints:**
   - Cart endpoints (user-specific)
   - Order endpoints (user-specific + admin view all)
   - Payment endpoints (user-specific)
   - Category/Dish endpoints (public read, admin write)
   - Table endpoints (as needed)

2. **Test the authorization:**
   - Create an admin user
   - Create a regular user
   - Test each endpoint with different user types
   - Verify 401 (unauthorized) and 403 (forbidden) responses

3. **Update frontend to handle:**
   - 401 errors → Redirect to login
   - 403 errors → Show "Access Denied" message
   - Role-based UI (hide admin features from regular users)

## 🔒 Security Best Practices

- ✅ Never commit `.env` file to git (add to .gitignore)
- ✅ Use strong, random JWT secrets in production
- ✅ Set `secure: true` cookies in production (HTTPS)
- ✅ Validate user ownership before modifying user-specific resources
- ✅ Always use `@UseGuards()` on sensitive endpoints
- ✅ Log security events (failed login attempts, unauthorized access)
