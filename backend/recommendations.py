import sys
import pickle
import pandas as pd
import os

model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
with open(model_path, 'rb') as f:
    cosine_sim2 = pickle.load(f)

movies_path = os.path.join(os.path.dirname(__file__), 'movies.csv')
df = pd.read_csv(movies_path)
indices = pd.Series(df.index, index=df['title']).drop_duplicates()

def get_recommendations(title, cosine_sim):
    if title not in indices:
        return ["Movie title not found in database."]
    
    idx = indices[title]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[1:21]
    movie_indices = [i[0] for i in sim_scores]
    return df['title'].iloc[movie_indices].tolist()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        movie_title = sys.argv[1]
        recommendations = get_recommendations(movie_title, cosine_sim2)
        for rec in recommendations:
            print(rec)
    else:
        print("Error: No movie title provided.")