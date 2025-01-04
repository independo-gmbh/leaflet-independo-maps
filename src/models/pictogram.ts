export interface Pictogram {
    /**
     * A unique identifier for the pictogram.
     * This ID is provided by the underlying data source (e.g., Global Symbols API).
     */
    id: string;

    /**
     * URL of the pictogram.
     */
    url: string;

    /**
     * Text to display below the pictogram.
     */
    displayText: string;

    /**
     * Label for the pictogram.
     */
    label?: string;

    /**
     * Description of the pictogram.
     */
    description?: string;

    /**
     * A flexible container for any additional metadata from the data source.
     */
    metadata?: Record<string, any>;
}
