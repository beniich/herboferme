# 🚀 Guide d'Implémentation FootballHub+ - Code Examples

## 📋 Table des Matières
1. [Setup Initial](#setup-initial)
2. [Service Auth](#service-auth)
3. [Service Ticketing](#service-ticketing)
4. [Service Events](#service-events)
5. [Service Shop](#service-shop)
6. [Service Payments](#service-payments)
7. [Frontend Components](#frontend-components)

---

## 🔧 Setup Initial

### 1. Backend - NestJS Setup

```bash
# Installation
npm i -g @nestjs/cli
nest new footballhub-backend

# Installation des dépendances
cd footballhub-backend
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install @nestjs/microservices @nestjs/websockets @nestjs/swagger
npm install @prisma/client prisma
npm install class-validator class-transformer
npm install stripe qrcode
npm install @nestjs/config joi
npm install ioredis @nestjs/bull bull
```

### 2. Prisma Setup

```bash
npx prisma init
npx prisma generate
npx prisma migrate dev --name init
```

### 3. Environment Variables

```env
# .env.development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/footballhub"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="15m"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRATION="7d"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="footballhub-media"

# SendGrid
SENDGRID_API_KEY="SG...."

# Twilio
TWILIO_ACCOUNT_SID="AC...."
TWILIO_AUTH_TOKEN="your-token"
TWILIO_PHONE_NUMBER="+1234567890"

# App
APP_URL="http://localhost:3000"
API_URL="http://localhost:4000"
PORT=4000
NODE_ENV="development"
```

---

## 🔐 Service Auth

### Auth Module Structure

```typescript
// apps/auth-service/src/auth.module.ts

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from '@libs/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRATION', '15m'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtStrategy, PrismaService],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
```

### Auth Service

```typescript
// apps/auth-service/src/services/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@libs/database';
import { RegisterDto, LoginDto } from '../dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Vérifier si l'utilisateur existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: dto.role || 'FAN',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    // Générer les tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    // Trouver l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Vérifier si l'utilisateur est actif
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Générer les tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async generateTokens(userId: string, email: string, role: string) {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRATION', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRATION', '7d'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}
```

### DTOs

```typescript
// apps/auth-service/src/dto/register.dto.ts

import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(['FAN', 'CLUB_ADMIN', 'ORGANIZER'])
  @IsOptional()
  role?: string;
}

// apps/auth-service/src/dto/login.dto.ts

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

### Auth Controller

```typescript
// apps/auth-service/src/controllers/auth.controller.ts

import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto, LoginDto } from '../dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req) {
    return req.user;
  }
}
```

### JWT Strategy

```typescript
// apps/auth-service/src/strategies/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const user = await this.authService.validateUser(payload.sub);
    return user;
  }
}
```

---

## 🎫 Service Ticketing

### Ticket Service

```typescript
// apps/ticket-service/src/services/ticket.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@libs/database';
import { CreateTicketDto } from '../dto';
import { QRService } from './qr.service';
import * as crypto from 'crypto';

@Injectable()
export class TicketService {
  constructor(
    private prisma: PrismaService,
    private qrService: QRService,
  ) {}

  async createTicket(dto: CreateTicketDto) {
    // Vérifier que l'événement existe
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Générer un numéro de ticket unique
    const ticketNumber = this.generateTicketNumber();
    
    // Générer un code QR unique
    const qrCodeData = this.generateQRCodeData(ticketNumber, dto.eventId);
    const qrCodeImage = await this.qrService.generateQRCode(qrCodeData);

    // Créer le ticket
    const ticket = await this.prisma.ticket.create({
      data: {
        eventId: dto.eventId,
        userId: dto.userId,
        ticketNumber,
        qrCode: qrCodeData,
        ticketType: dto.ticketType,
        price: dto.price,
        currency: dto.currency || 'USD',
        status: 'VALID',
      },
      include: {
        event: {
          select: {
            title: true,
            startDate: true,
            venue: true,
          },
        },
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      ...ticket,
      qrCodeImage,
    };
  }

  async validateTicket(qrCode: string, validatorId: string) {
    // Trouver le ticket
    const ticket = await this.prisma.ticket.findUnique({
      where: { qrCode },
      include: {
        event: true,
        user: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Vérifier le statut
    if (ticket.status !== 'VALID') {
      throw new BadRequestException('Ticket is not valid');
    }

    if (ticket.isValidated) {
      throw new BadRequestException('Ticket already used');
    }

    // Vérifier la date de l'événement
    const now = new Date();
    const eventStart = new Date(ticket.event.startDate);
    const eventEnd = ticket.event.endDate 
      ? new Date(ticket.event.endDate) 
      : new Date(eventStart.getTime() + 6 * 60 * 60 * 1000); // +6h par défaut

    if (now < eventStart || now > eventEnd) {
      throw new BadRequestException('Ticket not valid for current time');
    }

    // Marquer comme validé
    const updatedTicket = await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        isValidated: true,
        validatedAt: now,
        validatedBy: validatorId,
      },
      include: {
        event: true,
        user: true,
      },
    });

    return {
      success: true,
      ticket: updatedTicket,
      message: 'Ticket validated successfully',
    };
  }

  async getTicketByQR(qrCode: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { qrCode },
      include: {
        event: true,
        user: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  private generateTicketNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `TKT-${timestamp}-${random}`;
  }

  private generateQRCodeData(ticketNumber: string, eventId: string): string {
    const data = {
      ticket: ticketNumber,
      event: eventId,
      timestamp: Date.now(),
    };
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }
}
```

### QR Service

```typescript
// apps/ticket-service/src/services/qr.service.ts

import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QRService {
  async generateQRCode(data: string): Promise<string> {
    try {
      // Générer le QR code en base64
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return qrCodeDataURL;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  async generateQRCodeBuffer(data: string): Promise<Buffer> {
    try {
      const buffer = await QRCode.toBuffer(data, {
        errorCorrectionLevel: 'H',
        type: 'png',
        width: 300,
      });

      return buffer;
    } catch (error) {
      throw new Error('Failed to generate QR code buffer');
    }
  }

  validateQRCodeData(qrData: string): boolean {
    try {
      const decoded = JSON.parse(Buffer.from(qrData, 'base64').toString());
      return decoded.ticket && decoded.event && decoded.timestamp;
    } catch {
      return false;
    }
  }
}
```

### Ticket Controller

```typescript
// apps/ticket-service/src/controllers/ticket.controller.ts

import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  UseGuards,
  Req 
} from '@nestjs/common';
import { TicketService } from '../services/ticket.service';
import { CreateTicketDto, ValidateTicketDto } from '../dto';
import { JwtAuthGuard } from '@libs/common/guards';

@Controller('tickets')
export class TicketController {
  constructor(private ticketService: TicketService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createTicket(@Body() dto: CreateTicketDto, @Req() req) {
    return this.ticketService.createTicket({
      ...dto,
      userId: dto.userId || req.user.id,
    });
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  async validateTicket(@Body() dto: ValidateTicketDto, @Req() req) {
    return this.ticketService.validateTicket(dto.qrCode, req.user.id);
  }

  @Get('qr/:qrCode')
  @UseGuards(JwtAuthGuard)
  async getTicketByQR(@Param('qrCode') qrCode: string) {
    return this.ticketService.getTicketByQR(qrCode);
  }
}
```

---

## 🎪 Service Events

### Event Service

```typescript
// apps/event-service/src/services/event.service.ts

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@libs/database';
import { CreateEventDto, UpdateEventDto } from '../dto';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async createEvent(dto: CreateEventDto, userId: string) {
    // Vérifier que l'utilisateur appartient au club
    const membership = await this.prisma.clubMember.findFirst({
      where: {
        clubId: dto.clubId,
        userId,
        role: { in: ['ADMIN', 'MODERATOR'] },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not authorized to create events for this club');
    }

    const event = await this.prisma.event.create({
      data: {
        ...dto,
        status: 'DRAFT',
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    return event;
  }

  async getEvents(filters?: {
    clubId?: string;
    category?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }) {
    const events = await this.prisma.event.findMany({
      where: {
        ...(filters?.clubId && { clubId: filters.clubId }),
        ...(filters?.category && { category: filters.category }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.startDate && {
          startDate: {
            gte: filters.startDate,
          },
        }),
        ...(filters?.endDate && {
          endDate: {
            lte: filters.endDate,
          },
        }),
        isPublic: true,
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return events;
  }

  async getEventById(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        club: true,
        tickets: {
          select: {
            id: true,
            ticketType: true,
            price: true,
            status: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async updateEvent(id: string, dto: UpdateEventDto, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Vérifier les permissions
    const membership = await this.prisma.clubMember.findFirst({
      where: {
        clubId: event.clubId,
        userId,
        role: { in: ['ADMIN', 'MODERATOR'] },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not authorized to update this event');
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data: dto,
      include: {
        club: true,
      },
    });

    return updatedEvent;
  }

  async deleteEvent(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Vérifier les permissions
    const membership = await this.prisma.clubMember.findFirst({
      where: {
        clubId: event.clubId,
        userId,
        role: 'ADMIN',
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not authorized to delete this event');
    }

    await this.prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }
}
```

---

## 🛍️ Service Shop

### Product Service

```typescript
// apps/shop-service/src/services/product.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@libs/database';
import { CreateProductDto, UpdateProductDto } from '../dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async createProduct(dto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: dto,
    });

    return product;
  }

  async getProducts(filters?: {
    clubId?: string;
    category?: string;
    isActive?: boolean;
  }) {
    const products = await this.prisma.product.findMany({
      where: {
        ...(filters?.clubId && { clubId: filters.clubId }),
        ...(filters?.category && { category: filters.category }),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    return products;
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        club: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.update({
      where: { id },
      data: dto,
    });

    return product;
  }

  async updateStock(id: string, quantity: number) {
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });

    return product;
  }
}
```

### Order Service

```typescript
// apps/shop-service/src/services/order.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@libs/database';
import { CreateOrderDto } from '../dto';
import * as crypto from 'crypto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto, userId: string) {
    // Vérifier la disponibilité des produits
    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new BadRequestException(`Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}`,
        );
      }
    }

    // Calculer le total
    const subtotal = await this.calculateSubtotal(dto.items);
    const tax = subtotal * 0.1; // 10% tax
    const shipping = dto.shippingAddress ? 10 : 0; // $10 shipping
    const total = subtotal + tax + shipping;

    // Générer un numéro de commande
    const orderNumber = this.generateOrderNumber();

    // Créer la commande
    const order = await this.prisma.order.create({
      data: {
        userId,
        orderNumber,
        subtotal,
        tax,
        shipping,
        total,
        currency: dto.currency || 'USD',
        shippingAddress: dto.shippingAddress,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Décrémenter le stock
    for (const item of dto.items) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return order;
  }

  async updateOrderStatus(orderId: string, status: string) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return order;
  }

  async updatePaymentStatus(orderId: string, paymentStatus: string) {
    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus,
        ...(paymentStatus === 'COMPLETED' && { paidAt: new Date() }),
      },
    });

    return order;
  }

  private async calculateSubtotal(
    items: Array<{ productId: string; quantity: number; price: number }>,
  ): Promise<number> {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }
}
```

---

## 💳 Service Payments (Stripe)

### Payment Service

```typescript
// apps/payment-service/src/services/payment.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '@libs/database';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(config.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.paymentStatus === 'COMPLETED') {
      throw new BadRequestException('Order already paid');
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convertir en centimes
      currency: order.currency.toLowerCase(),
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      description: `Order ${order.orderNumber}`,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  async handleWebhook(signature: string, body: Buffer) {
    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    // Gérer les événements
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'COMPLETED',
        paymentMethod: 'stripe',
        paidAt: new Date(),
        status: 'CONFIRMED',
      },
    });

    // Envoyer une notification
    // await this.notificationService.sendOrderConfirmation(orderId);
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'FAILED',
      },
    });

    // Envoyer une notification
    // await this.notificationService.sendPaymentFailure(orderId);
  }
}
```

---

## 🎨 Frontend Components

### Ticket Card Component

```typescript
// src/components/features/tickets/TicketCard.tsx

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Calendar, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface TicketCardProps {
  ticket: {
    id: string;
    ticketNumber: string;
    ticketType: string;
    event: {
      title: string;
      startDate: string;
      venue: string;
      city: string;
    };
    qrCodeImage: string;
  };
  onViewQR?: () => void;
}

export function TicketCard({ ticket, onViewQR }: TicketCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-gold to-yellow-600 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold">{ticket.event.title}</h3>
            <p className="text-sm opacity-90">{ticket.ticketNumber}</p>
          </div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
            {ticket.ticketType}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>{format(new Date(ticket.event.startDate), 'PPP p')}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span>{ticket.event.venue}, {ticket.event.city}</span>
          </div>

          <div className="pt-4 border-t">
            <Button 
              onClick={onViewQR}
              className="w-full bg-gold hover:bg-gold/90"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Show QR Code
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### QR Code Display

```typescript
// src/components/features/tickets/QRCodeDisplay.tsx

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';

interface QRCodeDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: {
    ticketNumber: string;
    qrCodeImage: string;
    event: {
      title: string;
    };
  };
}

export function QRCodeDisplay({ isOpen, onClose, ticket }: QRCodeDisplayProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = ticket.qrCodeImage;
    link.download = `ticket-${ticket.ticketNumber}.png`;
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: ticket.event.title,
          text: `Ticket: ${ticket.ticketNumber}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Your Ticket</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
            <img
              src={ticket.qrCodeImage}
              alt="QR Code"
              className="w-64 h-64"
            />
          </div>

          <div className="text-center">
            <p className="font-semibold">{ticket.event.title}</p>
            <p className="text-sm text-gray-600">{ticket.ticketNumber}</p>
          </div>

          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Product Card

```typescript
// src/components/features/shop/ProductCard.tsx

import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    images: string[];
    price: number;
    comparePrice?: number;
    currency: string;
    stock: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.images[0] || '/placeholder-product.jpg'}
          alt={product.name}
          className="object-cover w-full h-full hover:scale-105 transition-transform"
        />
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold">
            -{discount}%
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold">Out of Stock</span>
          </div>
        )}
      </div>

      <CardContent className="pt-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {product.description}
        </p>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gold">
            ${product.price.toFixed(2)}
          </span>
          {product.comparePrice && (
            <span className="text-sm text-gray-500 line-through">
              ${product.comparePrice.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => addItem(product)}
          disabled={product.stock === 0}
          className="w-full bg-gold hover:bg-gold/90"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Analytics Chart

```typescript
// src/components/features/analytics/RevenueChart.tsx

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
    tickets: number;
    shop: number;
  }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#D4AF37"
              strokeWidth={2}
              name="Total Revenue"
            />
            <Line
              type="monotone"
              dataKey="tickets"
              stroke="#82ca9d"
              strokeWidth={2}
              name="Tickets"
            />
            <Line
              type="monotone"
              dataKey="shop"
              stroke="#8884d8"
              strokeWidth={2}
              name="Shop"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

---

## 🎯 Conclusion

Ce guide fournit une base solide pour implémenter FootballHub+. Chaque service est découplé, scalable et suit les meilleures pratiques.

### Prochaines étapes d'implémentation :
1. Setup de l'infrastructure (Docker, Kubernetes)
2. Configuration CI/CD
3. Tests unitaires et d'intégration
4. Documentation API (Swagger)
5. Monitoring et logging
6. Sécurité et audits

Tout est prêt pour démarrer le développement ! 🚀
