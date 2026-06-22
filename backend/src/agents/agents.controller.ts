/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import * as fs from 'fs';
import * as path from 'path';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Public()
  @Get('voices')
  voices() {
    return this.agentsService.voices();
  }

  @Public()
  @Get('admin/prompt-template')
  getPromptTemplate() {
    const filePath = path.join(process.cwd(), 'templates', 'prompt.txt');
    console.log('[GET] Reading prompt file from:', filePath);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      console.log('[GET] Successfully read prompt content');
      return { content };
    } catch (err) {
      console.error('[GET] Error reading file:', err.message);
      throw new Error('Failed to read prompt file');
    }
  }

  @Patch('admin/prompt-template')
  updatePromptTemplate(@Body() body: { content: string }) {
    const filePath = path.join(process.cwd(), 'templates', 'prompt.txt');
    console.log('[PATCH] Writing prompt file to:', filePath);

    try {
      fs.writeFileSync(filePath, body.content, 'utf8');
      console.log('[PATCH] Prompt updated successfully');
      return { message: 'Prompt updated successfully' };
    } catch (err) {
      console.error('[PATCH] Error writing file:', err.message);
      throw new Error('Failed to update prompt file');
    }
  }
  @Public()
  @Get('voices-elevenlabs')
  getElevenLabsVoices() {
    return this.agentsService.getElevenLabsVoices();
  }

  @Public()
  @Get('languages')
  languages() {
    return this.agentsService.languages();
  }

  @Public()
  @Post()
  create(@Body() createAgentDto: CreateAgentDto) {
    return this.agentsService.create(createAgentDto);
  }

  @Get()
  findAll() {
    return this.agentsService.findAll();
  }
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agentsService.findOne(id);
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgentDto: UpdateAgentDto) {
    return this.agentsService.update(id, updateAgentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agentsService.remove(+id);
  }

  @Put('update-llm/:user_id')
  updateLLM(@Param('user_id') id: string) {
    return this.agentsService.updateLlm(id);
  }

  @Public()
  @Post('generate-sample')
  async createsample(@Body() body: any, @Res() res: Response) {
    const { voice_id, text } = body;

    if (!voice_id || !text) {
      return res
        .status(400)
        .json({ message: 'voice_id and text are required' });
    }

    try {
      const audioBuffer = await this.agentsService.createsample(voice_id, text);

      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length,
      });

      return res.send(audioBuffer);
    } catch (error: any) {
      console.error('Error generating speech:', error?.message);
      return res.status(500).json({ message: 'Failed to generate voice' });
    }
  }
}
