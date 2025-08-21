import { PipeTransform, Injectable } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class SanitizePipe implements PipeTransform {
	transform(value: any) {
		if (value === null || value === undefined) return value;
		if (typeof value === 'string') {
			if (!/[<>]/.test(value)) return value;
			return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });
		}
		if (Array.isArray(value)) {
			return value.map(v => this.transform(v));
		}
		if (typeof value === 'object' && !(value instanceof Date)) {
			const result: Record<string, any> = {};
			for (const key of Object.keys(value)) {
				result[key] = this.transform(value[key]);
			}
			return result;
		}
		return value;
	}
}
