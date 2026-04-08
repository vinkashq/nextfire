import { render } from '@testing-library/react';
import Markdown from '@/components/markdown';

jest.mock('@/lib/utils', () => ({
  cn: (...inputs: any[]) => inputs.join(' '),
}));

// Mock isomorphic-dompurify if necessary, but it's better to test the real thing if possible.
// Since we can't run it anyway, this is mostly for documentation of the intent.

describe('Markdown Component Security', () => {
  it('should escape malicious HTML in markdown due to markdown-it config', () => {
    const maliciousMarkdown = '<img src=x onerror=alert("XSS")>';
    const { container } = render(<Markdown text={maliciousMarkdown} />);
    const img = container.querySelector('img');
    expect(img).toBeNull();
    expect(container.innerHTML).toContain('&lt;img src=x onerror=alert("XSS")&gt;');
  });

  it('should sanitize malicious links in markdown', () => {
    const maliciousMarkdown = '[click me](javascript:alert("XSS"))';
    const { container } = render(<Markdown text={maliciousMarkdown} />);
    const a = container.querySelector('a');
    // DOMPurify should sanitize the href
    expect(a?.getAttribute('href')).not.toBe('javascript:alert("XSS")');
  });
});
