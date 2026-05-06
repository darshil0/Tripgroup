# Firestore Composite Indexes

The following composite indexes are required for optimal performance of the Tripgroup application. While the application handles single-field indexes automatically, these composite indexes must be created in the Firebase Console.

## Trips Collection

| Collection Group | Properties to Index | Query Scope |
| :--- | :--- | :--- |
| `trips` | `status` (Ascending), `createdAt` (Descending) | Collection |
| `trips` | `adminId` (Ascending), `createdAt` (Descending) | Collection |
| `trips` | `participantIds` (Array-Contains), `createdAt` (Descending) | Collection |

## Participant Tracking

| Collection Group | Properties to Index | Query Scope |
| :--- | :--- | :--- |
| `participants` | `role` (Ascending), `joinedAt` (Descending) | Collection Group |

## Message History

| Collection Group | Properties to Index | Query Scope |
| :--- | :--- | :--- |
| `messages` | `tripId` (Ascending), `createdAt` (Ascending) | Collection |

---
**Note:** If you encounter a "Missing Index" error in the browser console, Firestore provides a direct link to create the required index with a single click.
