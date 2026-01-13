import { NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';

export const runtime = 'nodejs';

export async function POST(req: Request) {
    console.log('🔄 POST request received');

    const formData = await req.formData();
    const file = formData.get('deckImage') as File;

    if (!file) {
        console.error('🚫 No file received');
        return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    console.log('📸 Image received:', file.name, file.type, file.size);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('📦 Buffer created. Size:', buffer.length);

    const { data: { text } } = await Tesseract.recognize(buffer, "eng", {
        // 🔑 disable workers when running in Node.js
        workerPath: '',
        langPath: '',
        corePath: '',
        logger: (m) => console.log(m),
    });

    console.log('✅ OCR result:', text);

    return NextResponse.json({ text });
}
