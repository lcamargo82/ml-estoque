import {
  Controller,
  Get,
  Post,
  Res,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ImportExportService } from './import-export.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('import-export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('import-export')
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  @Get('export')
  @ApiOperation({ summary: 'Exporta a lista completa de produtos para planilha Excel' })
  @ApiResponse({ status: 200, description: 'Planilha Excel gerada' })
  exportProducts(@Res() res: Response) {
    return this.importExportService.exportProducts(res);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Importa/atualiza produtos a partir de planilha Excel' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de planilha Excel (.xlsx)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Produtos importados com sucesso' })
  importProducts(@UploadedFile() file: any, @Req() req) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }
    return this.importExportService.importProducts(file.buffer, req.user.username);
  }
}
