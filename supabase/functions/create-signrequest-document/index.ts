const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  console.log("🚀 Edge Function invoked - Method:", req.method);
  console.log("🚀 Request URL:", req.url);
  console.log("🚀 Request headers:", Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("✅ Handling CORS preflight request");
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    console.log("🔍 Starting SignRequest document creation process...");

    // Get required environment variables
    const signRequestApiKey = Deno.env.get("SIGNREQUEST_API_KEY");
    const templateId = Deno.env.get("SIGNREQUEST_SUBSCRIPTION_TEMPLATE_ID");
    
    console.log("🔑 Environment check:");
    console.log("- API Key present:", !!signRequestApiKey);
    console.log("- Template ID present:", !!templateId);
    console.log("- Template ID value:", templateId);

    if (!signRequestApiKey) {
      console.error("❌ SignRequest API key not found in environment");
      throw new Error("SignRequest API key not configured in Supabase secrets.");
    }

    if (!templateId) {
      console.error("❌ Template ID not found in environment");
      throw new Error("Template ID not configured in Supabase secrets.");
    }
    
    // For this test, we'll use dummy user data
    const userEmail = "test.signer@example.com";
    const userName = "John Doe Test";
    const userId = "test-user-12345";

    console.log("👤 Using test user data:");
    console.log("- Email:", userEmail);
    console.log("- Name:", userName);
    console.log("- User ID:", userId);

    console.log("📄 Creating SignRequest document with template:", templateId);

    // Step 1: Create document from template
    const docPayload = {
      template: `https://signrequest.com/api/v1/templates/${templateId}/`,
      name: `Test Document for ${userEmail}`,
    };

    console.log("📤 Document creation payload:", JSON.stringify(docPayload, null, 2));

    const docResponse = await fetch("https://signrequest.com/api/v1/documents/", {
      method: "POST",
      headers: {
        "Authorization": `Token ${signRequestApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(docPayload),
    });

    console.log("📥 Document creation response status:", docResponse.status);
    console.log("📥 Document creation response headers:", Object.fromEntries(docResponse.headers.entries()));

    if (!docResponse.ok) {
      const errorText = await docResponse.text();
      console.error("❌ Document creation failed with status:", docResponse.status);
      console.error("❌ Error response body:", errorText);
      throw new Error(`SignRequest document creation failed (${docResponse.status}): ${errorText}`);
    }

    const docData = await docResponse.json();
    console.log("✅ Document created successfully:");
    console.log("- Document UUID:", docData.uuid);
    console.log("- Document URL:", docData.url);
    console.log("- Document name:", docData.name);

    if (!docData.url) {
      console.error("❌ Document created but no URL was returned");
      console.error("❌ Full document data:", JSON.stringify(docData, null, 2));
      throw new Error("Document created but no URL was returned.");
    }

    // Step 2: Create a SignRequest to get the embed URL
    const srPayload = {
      document: docData.url,
      signers: [{
        email: userEmail,
        first_name: "John",
        last_name: "Doe",
        embed_url_user_id: userId
      }],
      from_email: "test@example.com",
    };

    console.log("📤 SignRequest creation payload:", JSON.stringify(srPayload, null, 2));

    const srResponse = await fetch("https://signrequest.com/api/v1/signrequests/", {
      method: "POST",
      headers: {
        "Authorization": `Token ${signRequestApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(srPayload),
    });

    console.log("📥 SignRequest creation response status:", srResponse.status);
    console.log("📥 SignRequest creation response headers:", Object.fromEntries(srResponse.headers.entries()));

    if (!srResponse.ok) {
      const errorText = await srResponse.text();
      console.error("❌ SignRequest creation failed with status:", srResponse.status);
      console.error("❌ Error response body:", errorText);
      throw new Error(`SignRequest signing request failed (${srResponse.status}): ${errorText}`);
    }

    const srData = await srResponse.json();
    console.log("✅ SignRequest created successfully:");
    console.log("- SignRequest UUID:", srData.uuid);
    console.log("- Signers count:", srData.signers?.length || 0);

    const embedUrl = srData.signers?.[0]?.embed_url;

    console.log("🔗 Embed URL extraction:");
    console.log("- First signer data:", JSON.stringify(srData.signers?.[0], null, 2));
    console.log("- Extracted embed URL:", embedUrl);

    if (!embedUrl) {
      console.error("❌ No embed URL found in response");
      console.error("❌ Full SignRequest data:", JSON.stringify(srData, null, 2));
      throw new Error("No signing URL returned. Check your SignRequest template to ensure it has a signer placeholder.");
    }

    const successResponse = { 
      embed_url: embedUrl,
      document_id: docData.uuid,
      signrequest_id: srData.uuid
    };

    console.log("🎉 Success! Returning response:", JSON.stringify(successResponse, null, 2));

    return new Response(
      JSON.stringify(successResponse),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("💥 Error in create-signrequest-document:", error);
    console.error("💥 Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    const errorResponse = { 
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString()
    };

    console.log("❌ Returning error response:", JSON.stringify(errorResponse, null, 2));
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});