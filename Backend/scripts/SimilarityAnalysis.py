import sys
import json
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
from scipy.spatial.distance import euclidean

# Read input from stdin
input_data = sys.stdin.read()

# Parse JSON data
data = json.loads(input_data)

# Extract existing songs and new song data
existing_songs = data['existing_songs']
new_song = data['new_song']

# Convert existing songs to a pandas DataFrame
df = pd.DataFrame(existing_songs)

# Define numerical features
numerical_features = [
    'danceability', 'energy', 'key', 'loudness', 'mode', 
    'speechiness', 'acousticness', 'instrumentalness', 
    'liveness', 'valence', 'tempo', 'duration_ms', 'time_signature'
]

# Ensure new_song has the same numerical features
new_song_features = {feature: new_song.get(feature, 0) for feature in numerical_features}

# Standardize the numerical features
scaler = StandardScaler()
scaled_data = scaler.fit_transform(df[numerical_features])

# Convert the scaled data back to a DataFrame
scaled_df = pd.DataFrame(scaled_data, columns=numerical_features)

# Save the standardized existing song data before adding distance and similarity columns
standardized_existing_songs = scaled_df.copy()

# Standardize the new song's features
new_song_standardized = scaler.transform(pd.DataFrame([new_song_features]))[0]

# Compute Euclidean distances between the new song and each song in the standardized dataset
euclidean_distances = scaled_df.apply(lambda row: euclidean(row, new_song_standardized), axis=1)

# Compute cosine similarities between the new song and each song in the standardized dataset
cosine_similarities = cosine_similarity(scaled_df, new_song_standardized.reshape(1, -1)).flatten()

# Normalize Euclidean distances (convert distances to a [0, 1] scale)
max_distance = euclidean_distances.max()
min_distance = euclidean_distances.min()
normalized_euclidean_distances = (euclidean_distances - min_distance) / (max_distance - min_distance)

# Add distances and similarities as new columns to the original DataFrame
df['euclidean_distance'] = normalized_euclidean_distances
df['cosine_similarity'] = cosine_similarities

# Calculate the mean of Euclidean distances and cosine similarities
mean_euclidean_distance = normalized_euclidean_distances.mean()
mean_cosine_similarity = cosine_similarities.mean()

# Sort by Euclidean distance and cosine similarity to find the most similar songs
sorted_by_euclidean = df.sort_values(by='euclidean_distance')
sorted_by_cosine = df.sort_values(by='cosine_similarity', ascending=False)

# Prepare output data
output_data = {    
    # 'euclidean_sorted': sorted_by_euclidean[['euclidean_distance']].head().to_dict(orient='records'),
    # 'cosine_sorted': sorted_by_cosine[['cosine_similarity']].head().to_dict(orient='records'),
    'mean_euclidean_distance': mean_euclidean_distance,
    'mean_cosine_similarity': mean_cosine_similarity
}

# Output the result as JSON
print(json.dumps(output_data))

# import sys
# import json
# import pandas as pd
# from sklearn.preprocessing import StandardScaler
# from sklearn.metrics.pairwise import cosine_similarity
# from scipy.spatial.distance import euclidean

# # Read input from stdin
# input_data = sys.stdin.read()

# # Parse JSON data
# data = json.loads(input_data)

# # Extract existing songs and new songs data
# existing_songs = data['existing_songs']
# new_songs = data['new_songs']

# # Convert existing songs to a pandas DataFrame
# df = pd.DataFrame(existing_songs)

# # Define numerical features
# numerical_features = [
#     'danceability', 'energy', 'key', 'loudness', 'mode', 
#     'speechiness', 'acousticness', 'instrumentalness', 
#     'liveness', 'valence', 'tempo', 'duration_ms', 'time_signature'
# ]

# # Standardize the numerical features
# scaler = StandardScaler()
# scaled_data = scaler.fit_transform(df[numerical_features])

# # Convert the scaled data back to a DataFrame
# scaled_df = pd.DataFrame(scaled_data, columns=numerical_features)

# # Initialize output data list
# output_data = []

# # Process each new song
# for new_song in new_songs:
#     track_id = new_song['trackId']
    
#     # Ensure new_song has the same numerical features
#     new_song_features = {feature: new_song.get(feature, 0) for feature in numerical_features}

#     # Standardize the new song's features
#     new_song_standardized = scaler.transform(pd.DataFrame([new_song_features]))[0]

#     # Compute Euclidean distances between the new song and each song in the standardized dataset
#     euclidean_distances = scaled_df.apply(lambda row: euclidean(row, new_song_standardized), axis=1)

#     # Compute cosine similarities between the new song and each song in the standardized dataset
#     cosine_similarities = cosine_similarity(scaled_df, new_song_standardized.reshape(1, -1)).flatten()

#     # Normalize Euclidean distances (convert distances to a [0, 1] scale)
#     max_distance = euclidean_distances.max()
#     min_distance = euclidean_distances.min()
#     normalized_euclidean_distances = (euclidean_distances - min_distance) / (max_distance - min_distance)

#     # Add distances and similarities as new columns to the original DataFrame
#     df['euclidean_distance'] = normalized_euclidean_distances
#     df['cosine_similarity'] = cosine_similarities

#     # Calculate the mean of Euclidean distances and cosine similarities
#     mean_euclidean_distance = normalized_euclidean_distances.mean()
#     mean_cosine_similarity = cosine_similarities.mean()

#     # Sort by Euclidean distance and cosine similarity to find the most similar songs
#     sorted_by_euclidean = df.sort_values(by='euclidean_distance')
#     sorted_by_cosine = df.sort_values(by='cosine_similarity', ascending=False)

#     # Prepare output data for the current new song
#     output_data.append({
#         'trackId': track_id,
#         'euclidean_sorted': sorted_by_euclidean[['euclidean_distance']].head().to_dict(orient='records'),
#         'cosine_sorted': sorted_by_cosine[['cosine_similarity']].head().to_dict(orient='records'),
#         'mean_euclidean_distance': mean_euclidean_distance,
#         'mean_cosine_similarity': mean_cosine_similarity
#     })

# # Output the result as JSON
# print(json.dumps(output_data, indent=4))



# import sys
# import json
# import pandas as pd
# from sklearn.preprocessing import StandardScaler
# from sklearn.metrics.pairwise import cosine_similarity
# from scipy.spatial.distance import euclidean

# # Read input from stdin
# input_data = sys.stdin.read()

# # Parse JSON data
# data = json.loads(input_data)

# # Extract existing songs and new song data
# existing_songs = data['existing_songs']
# new_songs = data['new_songs']

# # Convert existing songs to a pandas DataFrame
# df_existing_songs = pd.DataFrame(existing_songs)

# # Define numerical features
# numerical_features = [
#     'danceability', 'energy', 'key', 'loudness', 'mode', 
#     'speechiness', 'acousticness', 'instrumentalness', 
#     'liveness', 'valence', 'tempo', 'duration_ms', 'time_signature'
# ]

# # Standardize existing songs
# scaler = StandardScaler()
# scaled_existing_songs = scaler.fit_transform(df_existing_songs[numerical_features])
# scaled_df_existing_songs = pd.DataFrame(scaled_existing_songs, columns=numerical_features)

# # Prepare to collect results
# results = []

# # Iterate over each new song
# for new_song in new_songs:
#     track_id = new_song['trackId']
#     new_song_features = {feature: new_song.get(feature, 0) for feature in numerical_features}
    
#     # Standardize the new song's features
#     new_song_df = pd.DataFrame([new_song_features])
#     new_song_standardized = scaler.transform(new_song_df)[0]

#     # Compute Euclidean distances
#     euclidean_distances = scaled_df_existing_songs.apply(
#         lambda row: euclidean(row, new_song_standardized),
#         axis=1
#     )
    
#     # Compute cosine similarities
#     cosine_similarities = cosine_similarity(
#         scaled_df_existing_songs, 
#         new_song_standardized.reshape(1, -1)
#     ).flatten()

#     # Normalize Euclidean distances
#     max_distance = euclidean_distances.max()
#     min_distance = euclidean_distances.min()
#     normalized_euclidean_distances = (euclidean_distances - min_distance) / (max_distance - min_distance)

#     # Calculate average distances and similarities
#     avg_euclidean_distance = normalized_euclidean_distances.mean()
#     avg_cosine_similarity = cosine_similarities.mean()

#     # Collect results
#     results.append({
#         'trackId': track_id,
#         'average_euclidean_distance': avg_euclidean_distance,
#         'average_cosine_similarity': avg_cosine_similarity
#     })

# # Output the result as JSON
# print(json.dumps(results))

