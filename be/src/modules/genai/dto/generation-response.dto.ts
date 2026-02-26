import { ApiProperty } from '@nestjs/swagger';

export class GenerationDataDto {
  @ApiProperty({
    description: 'Generated text content',
    example:
      'Code flows like a stream\nBugs hide in shadows deep\nDebug and deploy',
  })
  generatedText: string;

  @ApiProperty({
    description: 'Credits used for generation',
    example: 5,
  })
  creditsUsed: number;

  @ApiProperty({
    description: 'Tokens used in generation',
    example: 50,
  })
  tokensUsed: number;

  @ApiProperty({
    description: 'Remaining credits after generation',
    example: 95,
  })
  remainingCredits: number;
}

export class GenerationResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Content generated successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Generation data',
    type: GenerationDataDto,
  })
  data: GenerationDataDto;
}

export class CostEstimationDto {
  @ApiProperty({
    description: 'Fixed credit cost for the operation',
    example: 5,
  })
  estimatedCost: number;

  @ApiProperty({
    description: 'Operation name',
    example: 'generateContent',
  })
  operation: string;
}
