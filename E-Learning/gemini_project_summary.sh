#!/bin/bash

# Configuration
PROJECT_DIR="."            # Root of your project (E-Learning)
CHUNK_SIZE=20000           # Approx bytes per chunk
SUMMARY_DIR="./summaries"  # Folder to store intermediate summaries
FINAL_SUMMARY="project_summary.txt"

mkdir -p "$SUMMARY_DIR"
rm -f "$FINAL_SUMMARY"

echo "🔹 Starting Gemini CLI project summarization..."
echo "Project directory: $PROJECT_DIR"
echo "Chunk size: $CHUNK_SIZE bytes"

# Step 1: Loop through all source files in backend + frontend
for file in $(find "$PROJECT_DIR" \
    -path "./backend/Controllers/*" -o \
    -path "./backend/Models/*" -o \
    -path "./backend/Services/*" -o \
    -path "./frontend/src/*" \
    -type f \( -name "*.cs" -o -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" \)); do

    echo "📄 Processing $file..."

    # Step 2: Split large files into chunks
    split -b $CHUNK_SIZE "$file" "$SUMMARY_DIR/chunk_$(basename $file)_"

    # Step 3: Summarize each chunk with Gemini CLI
    for chunk in "$SUMMARY_DIR"/chunk_$(basename $file)_*; do
        echo "   ➡ Summarizing chunk: $chunk"
        gemini -p "Summarize this code file into key functions, classes, and logic." < "$chunk" >> "$SUMMARY_DIR/$(basename $file)_summary.txt"
    done

    # Step 4: Append file summary to final project summary
    echo "==== Summary for $file ====" >> "$FINAL_SUMMARY"
    cat "$SUMMARY_DIR/$(basename $file)_summary.txt" >> "$FINAL_SUMMARY"
    echo -e "\n" >> "$FINAL_SUMMARY"
done

# Step 5: Generate overall project-level summary
echo "🔹 Generating overall project summary..."
gemini -p "Provide a high-level overview of this project: architecture, backend/frontend roles, database integration, and improvement suggestions." < "$FINAL_SUMMARY" >> "$FINAL_SUMMARY"

echo "✅ Project summarization complete!"
echo "Final summary saved to: $FINAL_SUMMARY"
