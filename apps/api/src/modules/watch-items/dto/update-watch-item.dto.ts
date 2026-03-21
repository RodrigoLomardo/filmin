import { PartialType } from '@nestjs/mapped-types';
import { CreateWatchItemDto } from './create-watch-item.dto';

export class UpdateWatchItemDto extends PartialType(CreateWatchItemDto) {}