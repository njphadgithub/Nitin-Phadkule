
declare const pdfjsLib: any;

export const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const reader = new FileReader();

        reader.onload = async (event) => {
            if (!event.target?.result) {
                return reject(new Error("Failed to read file."));
            }
            try {
                if (fileExtension === 'pdf') {
                    if (typeof pdfjsLib === 'undefined') {
                        return reject(new Error('pdf.js library is not loaded.'));
                    }
                    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
                    const pdf = await pdfjsLib.getDocument({ data: event.target.result as ArrayBuffer }).promise;
                    let textContent = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const text = await page.getTextContent();
                        textContent += text.items.map((item: { str: string }) => item.str).join(' ') + '\n';
                    }
                    resolve(textContent);
                } else if (fileExtension === 'txt' || fileExtension === 'csv') {
                    resolve(event.target.result as string);
                } else {
                    reject(new Error("Unsupported file type. Please upload a PDF, TXT, or CSV file."));
                }
            } catch (error) {
                console.error('Error processing file:', error);
                reject(new Error(`Could not process the ${fileExtension?.toUpperCase()} file.`));
            }
        };

        reader.onerror = (error) => {
            reject(error);
        };
        
        if (fileExtension === 'pdf') {
            reader.readAsArrayBuffer(file);
        } else if (fileExtension === 'txt' || fileExtension === 'csv') {
            reader.readAsText(file);
        } else {
             reject(new Error("Unsupported file type."));
        }
    });
};
