import { InjectionToken } from '@angular/core';
import { IMascotaRepository } from './repositories/mascota.repository.interface';

export const MASCOTA_REPOSITORY_TOKEN = new InjectionToken<IMascotaRepository>('IMascotaRepository');

