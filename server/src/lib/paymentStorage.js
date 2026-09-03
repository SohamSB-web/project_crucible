const { createClient } = require('@supabase/supabase-js');

const BUCKET = process.env.PAYMENTS_SUPABASE_BUCKET || 'PAYMENT';

let _paymentsSupabase;
function getPaymentsSupabase() {
    if (!_paymentsSupabase) {
        if (!process.env.PAYMENTS_SUPABASE_URL || !process.env.PAYMENTS_SUPABASE_SERVICE_KEY) {
            throw new Error('Payments Supabase environment variables are not configured.');
        }
        _paymentsSupabase = createClient(
            process.env.PAYMENTS_SUPABASE_URL,
            process.env.PAYMENTS_SUPABASE_SERVICE_KEY,
            { auth: { persistSession: false } }
        );
    }
    return _paymentsSupabase;
}

async function uploadPaymentScreenshot(filePath, buffer, mimeType) {
    const supabase = getPaymentsSupabase();

    const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, buffer, {
            contentType: mimeType,
            upsert: true,
        });

    if (error) {
        throw new Error(`Payment storage upload failed: ${error.message}`);
    }

    return { path: data.path };
}


const ID_BUCKET = process.env.IDS_SUPABASE_BUCKET || 'IDS';

async function uploadParticipantId(filePath, buffer, mimeType) {
    const supabase = getPaymentsSupabase();

    const { data, error } = await supabase.storage
        .from(ID_BUCKET)
        .upload(filePath, buffer, {
            contentType: mimeType,
            upsert: true,
        });

    if (error) {
        throw new Error(`ID card storage upload failed: ${error.message}`);
    }

    return { path: data.path };
}

module.exports = { uploadPaymentScreenshot, uploadParticipantId };
