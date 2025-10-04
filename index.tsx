import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Modality } from "@google/genai";

const translations = {
    // Header
    appTitle: { vi: 'FASHION STUDIO AI', en: 'FASHION STUDIO AI' },
    switchToLight: { vi: 'Chuyển sang chế độ sáng', en: 'Switch to light mode' },
    switchToDark: { vi: 'Chuyển sang chế độ tối', en: 'Switch to dark mode' },
    switchLanguage: { vi: 'Chuyển đổi ngôn ngữ', en: 'Switch language' },
    creationsCounterLabel: { vi: 'Ảnh đã tạo', en: 'Creations' },
    // Workflow Steps
    step1Title: { vi: '1. Người mẫu & Trang phục Gốc', en: '1. Original Model & Outfit' },
    step1Placeholder: { vi: 'Nhấp để tải ảnh người mẫu gốc', en: 'Click to upload original model photo' },
    step1Button: { vi: 'Tách Trang phục', en: 'Extract Outfit' },
    step2Title: { vi: '2. Trang phục đã tách', en: '2. Extracted Outfit' },
    step2Placeholder: { vi: 'Trang phục sau khi tách sẽ hiển thị ở đây', en: 'Extracted outfit will appear here' },
    step2Button: { vi: 'Tải về Trang phục', en: 'Download Outfit' },
    step3Title: { vi: '3. Người mẫu Mới', en: '3. New Model' },
    step3Placeholder: { vi: 'Nhấp để tải ảnh người mẫu mới', en: 'Click to upload new model photo' },
    step3Button: { vi: 'Ghép đồ & Tạo ảnh', en: 'Try-On & Generate' },
    // Final Results
    step4Title: { vi: '4. Kết quả Cuối cùng', en: '4. Final Results' },
    step4Placeholder: { vi: 'Kết quả sẽ hiển thị ở đây', en: 'Results will appear here' },
    viewImageAria: { vi: 'Xem ảnh', en: 'View image' },
    resetButton: { vi: 'Làm lại từ đầu', en: 'Start Over' },
    moreOptionsAria: { vi: 'Tùy chọn khác', en: 'More options' },
    downloadButton: { vi: 'Tải về máy', en: 'Download' },
    shareButton: { vi: 'Chia sẻ', en: 'Share' },
    // Share functionality
    shareTitle: { vi: 'Kết quả thử đồ ảo', en: 'Virtual Try-On Result' },
    shareText: { vi: 'Xem trang phục mới của tôi được tạo bởi AI!', en: 'Check out my new AI-generated outfit!' },
    shareError: { vi: 'Trình duyệt của bạn không hỗ trợ chia sẻ tệp tin này.', en: 'Your browser does not support sharing this file.' },
    // Loading messages
    loadingExtract: { vi: 'AI đang phân tích và tách trang phục...', en: 'AI is analyzing and extracting the outfit...' },
    loadingTryOn: { vi: 'AI đang kiến tạo bộ ảnh chuyên nghiệp (6 ảnh)...', en: 'AI is creating your professional photoshoot (6 images)...' },
    // Error messages
    errorExtract: { vi: 'Đã xảy ra lỗi khi cố gắng tách trang phục. Vui lòng thử lại.', en: 'An error occurred while extracting the outfit. Please try again.' },
    errorTryOn: { vi: 'Đã xảy ra lỗi khi thử đồ. Vui lòng thử lại.', en: 'An error occurred during the try-on. Please try again.' },
    errorNoImages: { vi: 'Không thể tạo ra bất kỳ hình ảnh nào.', en: 'Could not generate any images.' },
    // Panel
    panelTitle: { vi: 'Bảng điều khiển Sáng tạo', en: 'Creative Control Panel' },
    // Panel Options
    modelExpressionLabel: { vi: 'Biểu cảm Người mẫu', en: 'Model Expression' },
    modelExpressionOpt1: { vi: 'Trung tính, tự tin', en: 'Neutral, confident' },
    modelExpressionOpt2: { vi: 'Mỉm cười nhẹ', en: 'Gentle smile' },
    modelExpressionOpt3: { vi: 'Trầm tư (Artsy)', en: 'Pensive (Artsy)' },
    modelExpressionOpt4: { vi: 'Mạnh mẽ (Powerful)', en: 'Powerful' },

    backgroundLabel: { vi: 'Phông nền / Bối cảnh', en: 'Background / Scene' },
    backgroundOpt1: { vi: 'Studio - Nền xám', en: 'Studio - Gray background' },
    backgroundOpt2: { vi: 'Studio - Nền trắng', en: 'Studio - White background' },
    backgroundOpt3: { vi: 'Đường phố thành thị', en: 'Urban street' },
    backgroundOpt4: { vi: 'Quán cafe', en: 'Coffee shop' },
    backgroundOpt5: { vi: 'Bãi biển', en: 'Beach' },
    backgroundOpt6: { vi: 'Khu vườn', en: 'Garden' },

    lightingLabel: { vi: 'Kiểu ánh sáng', en: 'Lighting Style' },
    lightingOpt1: { vi: 'Studio 3 điểm sáng', en: '3-Point Studio' },
    lightingOpt2: { vi: 'Studio - Softbox', en: 'Studio - Softbox' },
    lightingOpt3: { vi: 'Ánh sáng gắt (Dramatic)', en: 'Harsh Light (Dramatic)' },
    lightingOpt4: { vi: 'Đèn viền (Rim light)', en: 'Rim Light' },
    lightingOpt5: { vi: 'Ánh sáng tự nhiên', en: 'Natural Light' },
    lightingOpt6: { vi: 'Giờ vàng (Golden hour)', en: 'Golden Hour' },

    cameraAngleLabel: { vi: 'Góc máy', en: 'Camera Angle' },
    cameraAngleOpt1: { vi: 'Ngang tầm mắt', en: 'Eye-level' },
    cameraAngleOpt2: { vi: 'Góc thấp', en: 'Low angle' },
    cameraAngleOpt3: { vi: 'Góc cao', en: 'High angle' },

    cameraLensLabel: { vi: 'Ống kính Máy ảnh', en: 'Camera Lens' },
    cameraLensOpt1: { vi: '50mm f/1.8 (Tiêu chuẩn)', en: '50mm f/1.8 (Standard)' },
    cameraLensOpt2: { vi: '35mm f/1.4 (Góc rộng)', en: '35mm f/1.4 (Wide)' },
    cameraLensOpt3: { vi: '85mm f/1.4 (Chân dung)', en: '85mm f/1.4 (Portrait)' },

    aspectRatioLabel: { vi: 'Tỷ lệ khung hình', en: 'Aspect Ratio' },
    aspectRatioOpt1: { vi: 'Chân dung (3:4)', en: 'Portrait (3:4)' },
    aspectRatioOpt2: { vi: 'Vuông (1:1)', en: 'Square (1:1)' },
    aspectRatioOpt3: { vi: 'Ngang (16:9)', en: 'Landscape (16:9)' },

    accessoriesLabel: { vi: 'Phụ kiện', en: 'Accessories' },
    accessoryPlaceholder: { vi: 'Tải ảnh', en: 'Upload' },

    colorStyleLabel: { vi: 'Phong cách Màu sắc', en: 'Color Style' },
    colorStyleOpt1: { vi: 'Lookbook thương mại', en: 'Commercial Lookbook' },
    colorStyleOpt2: { vi: 'Tạp chí thời trang', en: 'Fashion Magazine' },
    colorStyleOpt3: { vi: 'Tối giản (Minimalist)', en: 'Minimalist' },
    colorStyleOpt4: { vi: 'Màu film (Vintage)', en: 'Vintage Film' },
    colorStyleOpt5: { vi: 'Ảnh đen trắng', en: 'Black & White' },
    colorStyleOpt6: { vi: 'Màu sắc sống động', en: 'Vibrant Colors' },
};

const controlPanelOptions = {
    modelExpression: [
        { key: 'neutral', labelKey: 'modelExpressionOpt1', prompt: { vi: 'biểu cảm trung tính, tự tin', en: 'a neutral, confident expression' }},
        { key: 'smile', labelKey: 'modelExpressionOpt2', prompt: { vi: 'một nụ cười nhẹ nhàng, thần thái', en: 'a gentle, serene smile' }},
        { key: 'pensive', labelKey: 'modelExpressionOpt3', prompt: { vi: 'vẻ mặt trầm tư, nghệ thuật', en: 'a pensive, artistic expression' }},
        { key: 'powerful', labelKey: 'modelExpressionOpt4', prompt: { vi: 'ánh mắt mạnh mẽ, quyền lực', en: 'a powerful, strong gaze' }},
    ],
    background: [
        { key: 'studio-gray', labelKey: 'backgroundOpt1', prompt: { vi: 'nền studio màu xám trơn', en: 'plain gray studio background' }},
        { key: 'studio-white', labelKey: 'backgroundOpt2', prompt: { vi: 'nền studio màu trắng tinh', en: 'plain white studio background' }},
        { key: 'urban', labelKey: 'backgroundOpt3', prompt: { vi: 'đường phố thành thị ban ngày, kiến trúc hiện đại', en: 'urban street in daytime, modern architecture' }},
        { key: 'cafe', labelKey: 'backgroundOpt4', prompt: { vi: 'quán cafe với nội thất đẹp, ánh sáng cửa sổ', en: 'cafe with beautiful interior, window light' }},
        { key: 'beach', labelKey: 'backgroundOpt5', prompt: { vi: 'bãi biển nhiệt đới, trời trong, cát trắng', en: 'tropical beach, clear sky, white sand' }},
        { key: 'garden', labelKey: 'backgroundOpt6', prompt: { vi: 'khu vườn xanh mát, ánh nắng xuyên lá', en: 'lush garden, sunlight through leaves' }},
    ],
    lighting: [
        { key: '3-point', labelKey: 'lightingOpt1', prompt: { vi: 'thiết lập 3 điểm sáng studio chuyên nghiệp (key, fill, backlight)', en: 'professional 3-point studio lighting setup (key, fill, backlight)' }},
        { key: 'softbox', labelKey: 'lightingOpt2', prompt: { vi: 'ánh sáng studio dịu nhẹ, tản đều từ softbox lớn', en: 'soft, diffused studio light from a large softbox' }},
        { key: 'harsh', labelKey: 'lightingOpt3', prompt: { vi: 'ánh sáng gắt, tạo bóng đổ ấn tượng (high-fashion)', en: 'harsh lighting, creating dramatic shadows (high-fashion)' }},
        { key: 'rim', labelKey: 'lightingOpt4', prompt: { vi: 'đèn viền (rim light) làm nổi bật chủ thể', en: 'rim light to highlight the subject' }},
        { key: 'natural', labelKey: 'lightingOpt5', prompt: { vi: 'ánh sáng tự nhiên, trời trong xanh', en: 'natural daylight, clear blue sky' }},
        { key: 'golden-hour', labelKey: 'lightingOpt6', prompt: { vi: 'ánh sáng hoàng hôn (golden hour)', en: 'golden hour lighting' }},
    ],
    cameraAngle: [
        { key: 'eye-level', labelKey: 'cameraAngleOpt1', prompt: { vi: 'ngang tầm mắt', en: 'eye-level' }},
        { key: 'low', labelKey: 'cameraAngleOpt2', prompt: { vi: 'góc thấp hướng lên', en: 'low angle, looking up' }},
        { key: 'high', labelKey: 'cameraAngleOpt3', prompt: { vi: 'góc cao hướng xuống', en: 'high angle, looking down' }},
    ],
    cameraLens: [
        { key: '50mm', labelKey: 'cameraLensOpt1', prompt: { vi: 'ống kính 50mm f/1.8', en: '50mm f/1.8 lens' }},
        { key: '35mm', labelKey: 'cameraLensOpt2', prompt: { vi: 'ống kính 35mm f/1.4', en: '35mm f/1.4 lens' }},
        { key: '85mm', labelKey: 'cameraLensOpt3', prompt: { vi: 'ống kính 85mm f/1.4', en: '85mm f/1.4 lens' }},
    ],
    aspectRatio: [
        { key: '3:4', labelKey: 'aspectRatioOpt1', prompt: { vi: '3:4', en: '3:4' }},
        { key: '1:1', labelKey: 'aspectRatioOpt2', prompt: { vi: '1:1', en: '1:1' }},
        { key: '16:9', labelKey: 'aspectRatioOpt3', prompt: { vi: '16:9', en: '16:9' }},
    ],
    colorStyle: [
        { key: 'commercial', labelKey: 'colorStyleOpt1', prompt: { vi: 'màu sắc chân thực, lookbook thương mại, sắc nét', en: 'realistic colors, commercial lookbook, sharp' }},
        { key: 'magazine', labelKey: 'colorStyleOpt2', prompt: { vi: 'phong cách tạp chí thời trang (vogue, editorial)', en: 'fashion magazine style (vogue, editorial)' }},
        { key: 'minimalist', labelKey: 'colorStyleOpt3', prompt: { vi: 'phong cách tối giản (minimalist)', en: 'minimalist style' }},
        { key: 'vintage', labelKey: 'colorStyleOpt4', prompt: { vi: 'màu film, cổ điển (vintage film look)', en: 'vintage film look' }},
        { key: 'bw', labelKey: 'colorStyleOpt5', prompt: { vi: 'độ tương phản cao, đen trắng nghệ thuật', en: 'high-contrast, artistic black and white' }},
        { key: 'vibrant', labelKey: 'colorStyleOpt6', prompt: { vi: 'màu sắc sống động, rực rỡ (vibrant colors)', en: 'vibrant, saturated colors' }},
    ]
} as const;

type Language = 'vi' | 'en';
type Theme = 'dark' | 'light';

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
);

const GlobeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A11.953 11.953 0 0 1 12 13.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 0 3 12c0 .778.099 1.533.284 2.253m0 0a11.953 11.953 0 0 0 17.432 2.918" />
    </svg>
);


const App: React.FC = () => {
    const [originalModel, setOriginalModel] = useState<string | null>(null);
    const [extractedOutfit, setExtractedOutfit] = useState<string | null>(null);
    const [newModel, setNewModel] = useState<string | null>(null);
    const [accessoryImages, setAccessoryImages] = useState<(string | null)[]>([null, null, null]);
    const [finalResults, setFinalResults] = useState<string[]>([]);
    const [selectedFinalResultIndex, setSelectedFinalResultIndex] = useState<number>(0);
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    
    const [language, setLanguage] = useState<Language>('vi');
    const [theme, setTheme] = useState<Theme>('dark');
    const [generationCount, setGenerationCount] = useState(0);

    const [options, setOptions] = useState({
        modelExpression: 'neutral',
        background: 'studio-gray',
        lighting: '3-point',
        cameraAngle: 'eye-level',
        cameraLens: '50mm',
        colorStyle: 'commercial',
        aspectRatio: '3:4',
    });
    
    const t = useCallback((key: keyof typeof translations) => {
        return translations[key][language];
    }, [language]);

    const poseLabels = useMemo(() => ({
        vi: ['Chống hông', 'Nhìn nghiêng', 'Đi tới', 'Góc 3/4', 'Nhảy', 'Dựa tường'],
        en: ['Hips Stance', 'Side View', 'Walking', '3/4 Angle', 'Jumping', 'Leaning']
    }), []);
    
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

    useEffect(() => {
        const savedCount = localStorage.getItem('generationCount');
        if (savedCount) {
            setGenerationCount(parseInt(savedCount, 10));
        }
    }, []);

    useEffect(() => {
        document.body.classList.toggle('light-theme', theme === 'light');
    }, [theme]);
    
    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsActionMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleFileChange = (setter: React.Dispatch<React.SetStateAction<string | null>>) => 
        async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const base64 = await fileToBase64(e.target.files[0]);
            setter(base64);
        }
    };

    const handleAccessoryFileChange = (index: number) => async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const base64 = await fileToBase64(e.target.files[0]);
            setAccessoryImages(prev => {
                const newImages = [...prev];
                newImages[index] = base64;
                return newImages;
            });
            e.target.value = '';
        }
    };

    const removeAccessoryImage = (index: number) => {
        setAccessoryImages(prev => {
            const newImages = [...prev];
            newImages[index] = null;
            return newImages;
        });
    };
    
    const extractOutfit = useCallback(async () => {
        if (!originalModel) return;

        setIsLoading(true);
        setLoadingMessage(t('loadingExtract'));
        
        try {
            const prompt = {
                vi: 'Từ hình ảnh này, hãy tách riêng bộ trang phục mà người mẫu đang mặc. Giữ nguyên màu sắc và chi tiết của trang phục. Trả về hình ảnh trang phục trên nền trong suốt.',
                en: 'From this image, isolate the outfit the model is wearing. Preserve the colors and details of the clothing. Return the outfit image on a transparent background.'
            };
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { data: originalModel, mimeType: 'image/jpeg' } },
                        { text: prompt[language] }
                    ]
                },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    setExtractedOutfit(part.inlineData.data);
                    break;
                }
            }
        } catch (error) {
            console.error("Lỗi khi tách trang phục:", error);
            alert(t('errorExtract'));
        } finally {
            setIsLoading(false);
        }
    }, [ai, originalModel, language, t]);

    const getTryOnPrompt = useCallback((pose: string, currentOptions: typeof options, lang: Language) => {
        const getPromptFragment = (optionType: keyof typeof controlPanelOptions, optionKey: string) => {
            const option = controlPanelOptions[optionType].find(o => o.key === optionKey);
            return option ? option.prompt[lang] : '';
        };

        const promptOptions = {
            modelExpression: getPromptFragment('modelExpression', currentOptions.modelExpression),
            background: getPromptFragment('background', currentOptions.background),
            lighting: getPromptFragment('lighting', currentOptions.lighting),
            cameraAngle: getPromptFragment('cameraAngle', currentOptions.cameraAngle),
            cameraLens: getPromptFragment('cameraLens', currentOptions.cameraLens),
            colorStyle: getPromptFragment('colorStyle', currentOptions.colorStyle),
            aspectRatio: getPromptFragment('aspectRatio', currentOptions.aspectRatio),
        };

        if (lang === 'vi') {
            return `**Nhiệm vụ CỐT LÕI & QUAN TRỌNG NHẤT:**
**GIỮ NGUYÊN 100% TRANG PHỤC GỐC TỪ ẢNH SỐ 2.** Đây là mệnh lệnh quan trọng nhất, không được phép vi phạm dưới bất kỳ hình thức nào.

**Vai trò của bạn:** Bạn là một chuyên gia ghép ảnh kỹ thuật số (digital compositor), không phải là nhà thiết kế thời trang hay họa sĩ. Nhiệm vụ của bạn là thực hiện một thao tác kỹ thuật: cắt trang phục từ **Ảnh 2** và ghép nó lên người mẫu ở **Ảnh 1**.

**QUY TẮC VÀNG (Không thể phá vỡ):**
1.  **BẢO TOÀN TUYỆT ĐỐI:** Trang phục trong ảnh kết quả phải **GIỐNG HỆT 100%** trang phục trong **Ảnh 2**.
2.  **KHÔNG SÁNG TẠO:** **CẤM TUYỆT ĐỐI** sáng tạo, thay đổi, "cải thiện", thêm bớt hay diễn giải lại trang phục.
    *   **Kiểu dáng:** Giữ nguyên từng đường cắt, nếp gấp.
    *   **Màu sắc:** Giữ nguyên tuyệt đối, không được sai một tông màu nào.
    *   **Họa tiết & Chi tiết:** Sao chép y hệt, không thiếu một chi tiết nào.
    *   **Chất liệu:** Kết cấu vải phải được giữ nguyên.
3.  **ĐIỀU CHỈNH DUY NHẤT CHO PHÉP:** Chỉ điều chỉnh phối cảnh, ánh sáng, bóng đổ để trang phục khớp với tư thế của người mẫu một cách tự nhiên. Mọi thuộc tính khác của trang phục là **BẤT BIẾN**.

**Thông tin các ảnh đầu vào:**
- **Ảnh 1:** Người mẫu mới.
- **Ảnh 2:** Trang phục gốc cần được bảo toàn.
- **Các ảnh tiếp theo (nếu có):** Phụ kiện.

**Yêu cầu về hình ảnh kết quả:**
- **Người mẫu:** Sử dụng người mẫu từ **Ảnh 1**, giữ nguyên khuôn mặt, tóc, màu da.
- **Tư thế:** ${pose}.
- **Biểu cảm:** ${promptOptions.modelExpression}.
- **Bối cảnh:** ${promptOptions.background}.
- **Ánh sáng:** ${promptOptions.lighting}.
- **Máy ảnh & Ống kính:** ${promptOptions.cameraLens}, chất lượng 8K.
- **Góc máy:** ${promptOptions.cameraAngle}.
- **Phong cách:** ${promptOptions.colorStyle}, siêu thực, sắc nét.
- **Tỷ lệ:** ${promptOptions.aspectRatio}.

**KIỂM TRA CUỐI CÙNG TRƯỚC KHI XUẤT ẢNH:**
- Trang phục có giống hệt **Ảnh 2** không? Nếu có bất kỳ sự khác biệt nào, dù là nhỏ nhất, HÃY LÀM LẠI.
- **LỖI KHÔNG THỂ CHẤP NHẬN ĐƯỢC:** Thay đổi trang phục gốc.

**Đầu ra:** Chỉ trả về 1 tệp hình ảnh duy nhất. Không thêm văn bản.`;
        }
        return `**CORE & MOST CRITICAL MISSION:**
**PRESERVE 100% OF THE ORIGINAL OUTFIT FROM IMAGE 2.** This is the primary directive and must not be violated in any way.

**Your Role:** You are a digital compositor, not a fashion designer or an artist. Your task is purely technical: to cut the outfit from **Image 2** and seamlessly composite it onto the model in **Image 1**.

**THE GOLDEN RULE (Unbreakable):**
1.  **ABSOLUTE PRESERVATION:** The outfit in the final image must be **100% IDENTICAL** to the outfit in **Image 2**.
2.  **ZERO CREATIVITY:** It is **STRICTLY FORBIDDEN** to be creative, change, "improve", add, remove, or reinterpret the outfit.
    *   **Style:** Maintain every cut, fold, and seam.
    *   **Color:** Maintain the exact colors. No hue shifting.
    *   **Pattern & Details:** Copy every detail perfectly.
    *   **Fabric:** The texture of the fabric must be preserved.
3.  **ONLY PERMITTED ADJUSTMENT:** You may only adjust perspective, lighting, and shadows to make the outfit fit the model's pose naturally. All other attributes of the garment are **IMMUTABLE**.

**Input Image Information:**
- **Image 1:** The new model.
- **Image 2:** The original outfit to be preserved.
- **Subsequent Images (if any):** Accessories.

**Output Image Requirements:**
- **Model:** Use the model from **Image 1**, preserving their face, hair, and skin tone.
- **Pose:** ${pose}.
- **Expression:** ${promptOptions.modelExpression}.
- **Background:** ${promptOptions.background}.
- **Lighting:** ${promptOptions.lighting}.
- **Camera & Lens:** ${promptOptions.cameraLens}, 8K quality.
- **Camera Angle:** ${promptOptions.cameraAngle}.
- **Style:** ${promptOptions.colorStyle}, hyperrealistic, sharp.
- **Aspect Ratio:** ${promptOptions.aspectRatio}.

**FINAL CHECK BEFORE OUTPUTTING:**
- Is the outfit identical to **Image 2**? If there is any difference, however small, DISCARD AND RE-DO.
- **UNACCEPTABLE ERROR:** Any modification to the original outfit.

**Output:** Return only a single image file. No text.`;
    }, []);

    const tryOn = useCallback(async () => {
        if (!newModel || !extractedOutfit) return;

        setIsLoading(true);
        setLoadingMessage(t('loadingTryOn'));

        const parts = [
            { inlineData: { data: newModel, mimeType: 'image/jpeg' } },
            { inlineData: { data: extractedOutfit, mimeType: 'image/png' } },
        ];
        
        const validAccessoryImages = accessoryImages.filter(img => img !== null);
        if (validAccessoryImages.length > 0) {
            validAccessoryImages.forEach(accImage => {
                 parts.push({ inlineData: { data: accImage!, mimeType: 'image/jpeg' } });
            });
        }
        
        const poses = {
            vi: ['Nhìn thẳng, tay chống hông, toàn thân','Nhìn nghiêng 3/4, trung cảnh','Đi về phía máy ảnh, toàn thân','Hơi xoay người, góc 3/4, toàn thân','Nhảy lên không trung, ảnh chụp hành động, toàn thân','Dựa vào tường một cách tự nhiên, toàn thân'],
            en: ['Full body shot, looking straight, hand on hip', 'Medium shot, 3/4 view', 'Full body shot, walking towards the camera', 'Full body shot, slightly turned, 3/4 angle', 'Full body action shot, jumping in mid-air', 'Full body shot, leaning casually against a wall']
        };

        try {
            const imagePromises = poses[language].map(pose => {
                const promptText = getTryOnPrompt(pose, options, language);

                return ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: {
                        parts: [
                            ...parts,
                            { text: promptText }
                        ]
                    },
                    config: {
                        responseModalities: [Modality.IMAGE, Modality.TEXT],
                    },
                });
            });

            const responses = await Promise.all(imagePromises);

            const results = responses.map(response => {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        return part.inlineData.data;
                    }
                }
                return null;
            }).filter((result): result is string => result !== null);

            if (results.length > 0) {
                setFinalResults(results);
                setSelectedFinalResultIndex(0);
                setGenerationCount(prevCount => {
                    const newCount = prevCount + results.length;
                    localStorage.setItem('generationCount', newCount.toString());
                    return newCount;
                });
            } else {
                throw new Error(t('errorNoImages'));
            }

        } catch (error) {
            console.error("Lỗi khi thử đồ:", error);
            alert(t('errorTryOn'));
        } finally {
            setIsLoading(false);
        }
    }, [ai, newModel, extractedOutfit, accessoryImages, options, language, t, getTryOnPrompt]);

    const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setOptions(prev => ({ ...prev, [name]: value }));
    };

    const resetAll = () => {
        setOriginalModel(null);
        setExtractedOutfit(null);
        setNewModel(null);
        setAccessoryImages([null, null, null]);
        setFinalResults([]);
        setSelectedFinalResultIndex(0);
        setIsActionMenuOpen(false);
    };
    
    const downloadImage = (base64Image: string, fileName: string) => {
        if (!base64Image) return;
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${base64Image}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownload = () => {
        const currentImage = finalResults[selectedFinalResultIndex];
        if (currentImage) {
            downloadImage(currentImage, `result_${selectedFinalResultIndex + 1}.png`);
            setIsActionMenuOpen(false);
        }
    };

    const base64ToFile = (base64: string, filename: string): File => {
        const mimeType = 'image/jpeg';
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        return new File([blob], filename, { type: mimeType });
    };

    const handleShare = async () => {
        const currentImage = finalResults[selectedFinalResultIndex];
        if (!currentImage) return;

        try {
            const imageFile = base64ToFile(currentImage, `result_${selectedFinalResultIndex + 1}.jpg`);
            if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
                await navigator.share({
                    files: [imageFile],
                    title: t('shareTitle'),
                    text: t('shareText'),
                });
                setIsActionMenuOpen(false);
            } else {
                alert(t('shareError'));
            }
        } catch (error) {
            console.error('Lỗi khi chia sẻ:', error);
        }
    };

    const renderPlaceholder = (
        image: string | null, 
        onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
        text: string
    ) => (
        <label className="image-placeholder">
            <input type="file" accept="image/*" className="sr-only" style={{display: 'none'}} onChange={onFileChange} />
            {image ? <img src={`data:image/jpeg;base64,${image}`} alt={text} /> : (
                <div className="placeholder-text">
                    <span className="placeholder-icon">🖼️</span>
                    <p>{text}</p>
                </div>
            )}
        </label>
    );

    const renderSelect = (
        labelKey: keyof typeof translations, 
        name: keyof typeof options, 
        optionsArray: readonly { key: string; labelKey: keyof typeof translations }[]
    ) => (
        <div className="form-group">
            <label htmlFor={name}>{t(labelKey)}</label>
            <select id={name} name={name} value={options[name]} onChange={handleOptionChange}>
                {optionsArray.map(opt => <option key={opt.key} value={opt.key}>{t(opt.labelKey)}</option>)}
            </select>
        </div>
    );

    return (
        <>
            <header>
                <div className="generation-counter">
                    <span>{t('creationsCounterLabel')}</span>
                    <span className="counter-value">{generationCount}</span>
                </div>
                <div className="title-container">
                    <h1>{t('appTitle')}</h1>
                    <p className="subtitle">Designer: HUY BUI NGOC</p>
                </div>
                <div className="header-actions">
                     <div className="tooltip-wrapper">
                        <button 
                            className="icon-btn" 
                            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')} 
                            aria-label={t(theme === 'dark' ? 'switchToLight' : 'switchToDark')}
                        >
                            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                        </button>
                        <span className="tooltip-text">{t(theme === 'dark' ? 'switchToLight' : 'switchToDark')}</span>
                    </div>
                    <div className="tooltip-wrapper">
                        <button 
                            className="icon-btn" 
                            onClick={() => setLanguage(prev => prev === 'vi' ? 'en' : 'vi')} 
                            aria-label={t('switchLanguage')}
                        >
                           <GlobeIcon />
                        </button>
                        <span className="tooltip-text">{t('switchLanguage')}</span>
                    </div>
                </div>
            </header>
            <main className="app-container">
                <div className={`main-workflow ${finalResults.length > 0 ? 'results-visible' : ''}`}>
                    <div className="workflow-top">
                        <section className="workflow-column">
                            <h2>{t('step1Title')}</h2>
                            {renderPlaceholder(originalModel, handleFileChange(setOriginalModel), t('step1Placeholder'))}
                            <button className="btn" onClick={extractOutfit} disabled={!originalModel || isLoading}>
                                {t('step1Button')}
                            </button>
                        </section>
                        <section className="workflow-column">
                            <h2>{t('step2Title')}</h2>
                            <div className="image-placeholder">
                               {extractedOutfit ? <img src={`data:image/png;base64,${extractedOutfit}`} alt={t('step2Title')} /> : (
                                    <div className="placeholder-text">
                                        <span className="placeholder-icon">👕</span>
                                        <p>{t('step2Placeholder')}</p>
                                    </div>
                                )}
                            </div>
                            <button className="btn btn-secondary" onClick={() => downloadImage(extractedOutfit!, 'outfit.png')} disabled={!extractedOutfit || isLoading}>
                                {t('step2Button')}
                            </button>
                        </section>
                        <section className="workflow-column">
                            <h2>{t('step3Title')}</h2>
                            {renderPlaceholder(newModel, handleFileChange(setNewModel), t('step3Placeholder'))}
                            <button className="btn" onClick={tryOn} disabled={!newModel || !extractedOutfit || isLoading}>
                                {t('step3Button')}
                            </button>
                        </section>
                    </div>
                    <section className="workflow-column workflow-bottom">
                        <h2>{t('step4Title')}</h2>
                        {finalResults.length > 0 ? (
                            <div className="results-content-wrapper">
                                <div className="results-sidebar">
                                    <div className="thumbnail-container">
                                        {finalResults.slice(0, 3).map((image, index) => (
                                            <div className="thumbnail-wrapper" key={index}>
                                                <div
                                                    className={`thumbnail ${index === selectedFinalResultIndex ? 'active' : ''}`}
                                                    onClick={() => setSelectedFinalResultIndex(index)}
                                                    role="button"
                                                    aria-label={`${t('viewImageAria')} ${index + 1}: ${poseLabels[language][index]}`}
                                                    tabIndex={0}
                                                    onKeyDown={(e) => e.key === 'Enter' && setSelectedFinalResultIndex(index)}
                                                >
                                                    <img src={`data:image/jpeg;base64,${image}`} alt={`Result ${index + 1} - ${poseLabels[language][index]}`} />
                                                </div>
                                                <p className="thumbnail-label">{poseLabels[language][index]}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="results-main-view">
                                    <div 
                                        className="image-placeholder"
                                        style={{ aspectRatio: options.aspectRatio.replace(':', ' / ') }}
                                    >
                                        <img src={`data:image/jpeg;base64,${finalResults[selectedFinalResultIndex]}`} alt={t('step4Title')} />
                                    </div>
                                    <div className="bottom-actions">
                                        <button className="btn btn-secondary" onClick={resetAll} disabled={isLoading}>
                                            {t('resetButton')}
                                        </button>
                                        <div className="action-menu-container" ref={menuRef}>
                                            <button 
                                                className="btn action-menu-trigger" 
                                                onClick={() => setIsActionMenuOpen(prev => !prev)}
                                                aria-label={t('moreOptionsAria')}
                                                aria-haspopup="true"
                                                aria-expanded={isActionMenuOpen}
                                            >
                                                ...
                                            </button>
                                            {isActionMenuOpen && (
                                                <div className="action-menu">
                                                    <button className="action-menu-item" onClick={handleDownload}>
                                                        <span className="menu-icon">📥</span> {t('downloadButton')}
                                                    </button>
                                                    {navigator.share && (
                                                        <button className="action-menu-item" onClick={handleShare}>
                                                            <span className="menu-icon">🔗</span> {t('shareButton')}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="results-sidebar">
                                    <div className="thumbnail-container">
                                        {finalResults.slice(3, 6).map((image, i) => {
                                            const index = i + 3;
                                            return (
                                                <div className="thumbnail-wrapper" key={index}>
                                                    <div
                                                        className={`thumbnail ${index === selectedFinalResultIndex ? 'active' : ''}`}
                                                        onClick={() => setSelectedFinalResultIndex(index)}
                                                        role="button"
                                                        aria-label={`${t('viewImageAria')} ${index + 1}: ${poseLabels[language][index]}`}
                                                        tabIndex={0}
                                                        onKeyDown={(e) => e.key === 'Enter' && setSelectedFinalResultIndex(index)}
                                                    >
                                                        <img src={`data:image/jpeg;base64,${image}`} alt={`Result ${index + 1} - ${poseLabels[language][index]}`} />
                                                    </div>
                                                    <p className="thumbnail-label">{poseLabels[language][index]}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                             <div className="image-placeholder">
                                <div className="placeholder-text">
                                    <span className="placeholder-icon">✨</span>
                                    <p>{t('step4Placeholder')}</p>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
                <aside className="advanced-panel">
                    <h2>{t('panelTitle')}</h2>
                    {renderSelect('modelExpressionLabel', 'modelExpression', controlPanelOptions.modelExpression)}
                    {renderSelect('backgroundLabel', 'background', controlPanelOptions.background)}
                    {renderSelect('lightingLabel', 'lighting', controlPanelOptions.lighting)}
                    {renderSelect('cameraAngleLabel', 'cameraAngle', controlPanelOptions.cameraAngle)}
                    {renderSelect('cameraLensLabel', 'cameraLens', controlPanelOptions.cameraLens)}
                    {renderSelect('aspectRatioLabel', 'aspectRatio', controlPanelOptions.aspectRatio)}
                    <div className="form-group">
                        <label>{t('accessoriesLabel')}</label>
                        <div className="accessory-uploads-container">
                            {accessoryImages.map((image, index) => (
                                <label key={index} className="accessory-placeholder">
                                    <input type="file" accept="image/*" className="sr-only" style={{display: 'none'}} onChange={handleAccessoryFileChange(index)} />
                                    {image ? (
                                        <>
                                            <img src={`data:image/jpeg;base64,${image}`} alt={`Accessory ${index + 1}`} />
                                            <button className="remove-accessory-btn" onClick={(e) => { e.preventDefault(); removeAccessoryImage(index); }}>×</button>
                                        </>
                                     ) : (
                                        <div className="placeholder-text small">
                                            <span className="placeholder-icon">👜</span>
                                            <p>{t('accessoryPlaceholder')}</p>
                                        </div>
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>
                    {renderSelect('colorStyleLabel', 'colorStyle', controlPanelOptions.colorStyle)}
                </aside>

                {isLoading && (
                    <div className={`loading-overlay visible`}>
                        <div className="spinner"></div>
                        <p className="loading-text">{loadingMessage}</p>
                    </div>
                )}
            </main>
        </>
    );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);