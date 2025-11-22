import React from "react";
import { Editor } from "@tinymce/tinymce-react";

interface TinyMCEProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
}

const TinyMCE: React.FC<TinyMCEProps> = ({ value, onChange, height = 300 }) => {
  return (
    <Editor
      apiKey="ieu06mnezg6g69gniavhf5u8nceazats4uk2rtf42srz9xml"
      value={value}
      init={{
        height,
        menubar: false,
        plugins: "advlist autolink lists link image charmap searchreplace visualblocks code fullscreen insertdatetime media table help wordcount",
        toolbar: "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
        // Konfigurasi autolink yang lebih baik
        autolink_pattern: /^(https?:\/\/[^\s<>"{}|\\^`\[\]]+(?:[^\s<>"{}|\\^`\[\].,;:!?]|(?:[.,;:!?](?!\s)))*)$/i,
        convert_urls: true,
        relative_urls: false,
        remove_script_host: true,
        // Enable autolink untuk semua URL
        autolink_enable: true,
        // Target untuk link
        target_list: [
          {title: 'New window', value: '_blank'},
          {title: 'Same window', value: '_self'}
        ],
        // Default target
        default_link_target: '_blank',
        // Link rel
        link_rel_list: [
          {title: 'None', value: ''},
          {title: 'Noopener', value: 'noopener'},
          {title: 'Noreferrer', value: 'noreferrer'},
          {title: 'Both', value: 'noopener noreferrer'}
        ],
        // Default rel
        default_link_rel: 'noopener noreferrer',
        // Content CSS untuk styling link
        content_css: false,
        content_style: `
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            font-size: 14px;
            line-height: 1.5;
          }
          a { 
            color: #2563eb !important; 
            text-decoration: underline !important; 
            cursor: pointer !important;
            font-weight: 500 !important;
          }
          a:hover { 
            color: #1d4ed8 !important; 
            background-color: rgba(37, 99, 235, 0.1) !important;
            border-radius: 3px !important;
            padding: 1px 2px !important;
          }
          a:visited { 
            color: #7c3aed !important; 
          }
          a:active {
            color: #dc2626 !important;
          }
        `,
        // Setup function yang lebih baik untuk auto-detect URL
        setup: (editor) => {
          // Auto-detect URL saat user mengetik dengan delay yang lebih lama
          let timeoutId: NodeJS.Timeout;
          
          const processUrls = (content: string) => {
            // Regex yang lebih komprehensif untuk mendeteksi URL termasuk Google Drive
            const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+(?:[^\s<>"{}|\\^`\[\].,;:!?]|(?:[.,;:!?](?!\s)))*)/g;
            const urls = content.match(urlRegex);
            
            if (urls) {
              let newContent = content;
              urls.forEach(url => {
                // Cek apakah URL sudah menjadi link
                if (!newContent.includes(`<a href="${url}"`) && !newContent.includes(`href="${url}"`)) {
                  const cleanUrl = url.replace(/[.,;:!?]+$/, '');
                  const punctuation = url.match(/[.,;:!?]+$/)?.[0] || '';
                  const linkHtml = `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline; cursor: pointer; font-weight: 500;">${cleanUrl}</a>${punctuation}`;
                  newContent = newContent.replace(url, linkHtml);
                }
              });
              
              if (newContent !== content) {
                editor.setContent(newContent);
              }
            }
          };
          
          // Event handler untuk klik link di dalam editor
          editor.on('click', (e) => {
            const target = e.target as HTMLElement;
            const linkElement = target.closest('a');
            
            if (linkElement) {
              e.preventDefault();
              e.stopPropagation();
              const href = linkElement.getAttribute('href');
              
              if (href) {
                try {
                  new URL(href);
                  window.open(href, '_blank', 'noopener,noreferrer');
                } catch (error) {
                  console.error('Invalid URL:', href);
                }
              }
            }
          });
          
          editor.on('keyup', (e) => {
            if (e.key === ' ' || e.key === 'Enter' || e.key === 'Tab') {
              clearTimeout(timeoutId);
              timeoutId = setTimeout(() => {
                const content = editor.getContent();
                processUrls(content);
              }, 300); // Delay lebih pendek untuk responsivitas
            }
          });
          
          // Auto-detect URL saat paste dengan delay yang lebih lama
          editor.on('paste', (e) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              const content = editor.getContent();
              processUrls(content);
            }, 500); // Delay lebih pendek untuk paste
          });
          
          // Auto-detect URL saat content berubah
          editor.on('input', () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              const content = editor.getContent();
              processUrls(content);
            }, 1000); // Delay lebih lama untuk input
          });
          
          // Auto-detect URL saat editor selesai dimuat
          editor.on('init', () => {
            const content = editor.getContent();
            processUrls(content);
          });
        },
      }}
      onEditorChange={(newValue) => onChange(newValue)}
    />
  );
};

export default TinyMCE;
