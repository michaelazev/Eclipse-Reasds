import { render, screen } from '@testing-library/react';
import SupabaseStatusBanner from '../SupabaseStatusBanner';
import * as supabaseService from '../../services/supabaseService';
import { describe, it, expect, vi, type Mock } from 'vitest';

vi.mock('../../services/supabaseService', async () => ({
  checkSupabaseStatus: vi.fn()
}));

describe('SupabaseStatusBanner', () => {
  it('shows ready message when service is ready', () => {
    (supabaseService.checkSupabaseStatus as Mock).mockReturnValue({ hasClient: true, hasUrl: true, hasKey: true, isReady: true });
    render(<SupabaseStatusBanner />);
    expect(screen.getByText(/Supabase pronto/i)).toBeInTheDocument();
  });
});
