import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from '@/app.module'
import { StripeExceptionFilter } from '@/common/filters/stripe-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  app.useGlobalFilters(new StripeExceptionFilter())
  app.setGlobalPrefix('api')

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('nest-stripe')
      .setDescription('Stripe-backed payments API')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config))
  }

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
